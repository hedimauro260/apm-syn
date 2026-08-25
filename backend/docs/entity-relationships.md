# APM SYN - Relationships

**`Transaction` é o ponto de encontro entre as entidades**.
Ela registra um evento financeiro e referencia quem foi afetado por ele.

Fica consolidado assim:

### User

Está perfeito:

```text
User
│
├── 1:N → Wallet
├── 1:N → Website
├── 1:N → Transaction
└── 1:N → Goal
```

Ou seja, cada usuário possui várias wallets, websites, transactions e goals.

E cada uma dessas entidades pertence a um único usuário.

---

### Wallet ↔ Transaction

Sua percepção de separar origem e destino está certíssima.

```text
Wallet
│
├── 1:N → Transaction como origem
│
└── 1:N → Transaction como destino
```

Exemplo de transferência:

```text
Binance
   │
   │ origem
   ▼
Transaction
   │
   │ destino
   ▼
Trust Wallet
```

Mas uma wallet não precisa participar das duas formas.

Uma retirada de website seria:

```text
Website
   │
   │ origem
   ▼
Transaction
   │
   │ destino
   ▼
Wallet
```

Uma retirada manual da carteira:

```text
Wallet
   │
   │ origem
   ▼
Transaction
```

Uma entrada manual:

```text
Transaction
   │
   │ destino
   ▼
Wallet
```

Então eu definiria o relacionamento semanticamente como:

> **Wallet pode ser origem e/ou destino de uma Transaction.**

Isso é mais preciso do que dizer apenas que a wallet “gera” transactions.

---

### Website ↔ Transaction

Aqui eu ajustaria levemente a palavra **gera**.

Ela faz sentido no nosso jeito de falar, mas no modelo de domínio eu usaria:

> **Website é a origem de determinadas Transactions.**

Então:

```text
Website
│
└── 1:N → Transaction como origem
```

Por exemplo:

```text
Website
   │
   ├── WEBSITE_EARNING
   │
   └── WEBSITE_WITHDRAWAL
```

Isso nos dá uma linguagem consistente:

```text
Transaction
├── source
└── destination
```

E:

```text
source
├── Wallet
└── Website

destination
└── Wallet
```

Neste momento, pelo domínio que você definiu, o Website não aparece como destino. Apenas como origem.

---

### Goal ↔ Wallet

Aqui você identificou corretamente o relacionamento:

```text
Goal N:N Wallet
```

Uma Goal pode utilizar várias wallets:

```text
Goal: Depositar $100 por semana

├── Binance
├── Trust Wallet
└── MetaMask
```

E uma Wallet pode participar de várias Goals, se as regras permitirem.

Além do relacionamento, existe uma **configuração própria da participação**:

```text
Goal
   │
   ├── Wallet A
   │    └── weeklyGoal: $50
   │
   └── Wallet B
        └── weeklyGoal: $50
```

Então conceitualmente existe uma relação intermediária:

```text
Goal
   │
   │ N:N
   ▼
GoalWalletConfig
   ▲
   │
Wallet
```

Não precisa ser uma entidade independente; pode continuar como uma estrutura interna da `Goal`, como já acontece no APM Lite.

---

### Goal ↔ Transaction

Aqui está a única relação que eu **não modelaria como um relacionamento tradicional**.

Você escreveu:

> Goal utiliza Transactions elegíveis.

Exatamente. Mas eu evitaria armazenar:

```text
Goal
└── transactionIds[]
```

Porque isso criaria duplicação e problemas quando uma transação fosse editada.

Eu trataria como uma relação **derivada por consulta**.

A Goal considera uma Transaction quando ela atende às regras:

```text
Transaction
├── destinationWallet ∈ goal.wallets
├── type = depósito elegível
├── countsTowardGoal = true
└── date dentro do período da Goal
```

Então o relacionamento é conceitualmente:

```text
Goal
   │
   │ considera
   ▼
Transactions elegíveis
```

Mas, no banco, provavelmente não existirá uma referência direta `goalId` na Transaction.

Essa distinção vai evitar que a meta fique “dona” das transações.

---

## Transaction como entidade central

Aqui eu consolidaria o mapa assim:

```text
                    User
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
       Wallet     Website      Goal
          │          │          │
          │          │          │
          └─────┐ ┌──┘          │
                ▼ ▼             │
             Transaction ◄──────┘
                   ▲        considera
                   │
                 pertence
                   │
                  User
```

Ou, de forma mais explícita:

```text
Transaction
│
├── pertence → User
│
├── source
│   ├── Wallet?
│   └── Website?
│
├── destination
│   └── Wallet?
│
└── pode ser considerada por → Goal
    (relação derivada, não referência direta)
```

### Mapa consolidado

Eu registraria as relações da seguinte forma:

**User**

```text
User 1:N Wallet
User 1:N Website
User 1:N Transaction
User 1:N Goal
```

**Wallet**

```text
Wallet 1:N Transaction
como source

Wallet 1:N Transaction
como destination
```

**Website**

```text
Website 1:N Transaction
como source
```

**Goal**

```text
Goal N:N Wallet
```

com configuração da participação da wallet dentro da Goal.

E:

```text
Goal ── considera ──► Transaction
```

Essa relação é **derivada pelas regras de elegibilidade**, não necessariamente armazenada.

**Transaction**

```text
Transaction N:1 User

Transaction N:1 Wallet?
como source

Transaction N:1 Wallet?
como destination

Transaction N:1 Website?
como source
```

Os `?` são importantes: nem toda transação terá todas essas relações.

Por exemplo, uma entrada manual de origem externa:

```text
source: null / external
destination: Wallet
```

Uma retirada manual:

```text
source: Wallet
destination: null / external
```

Uma transferência:

```text
source: Wallet A
destination: Wallet B
```

Uma retirada de website:

```text
source: Website
destination: Wallet
```

E um ganho no website:

```text
source: Website
destination: Website balance
```
