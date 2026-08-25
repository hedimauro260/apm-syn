# APM SYN - Entidades

**`Asset` realmente não precisa ser uma entidade persistida do APM SYN**.

**Entidades principais**

- `User`
- `Wallet`
- `Website`
- `Transaction`
- `Goal`

E uma categoria que eu chamaria de **conceitos externos ou dados de referência**:

- `Asset`

### User

Sim, entidade. Mesmo usando Clerk.

O Clerk será a autoridade para dados de autenticação, como:

```text
login
senha
sessão
email verificado
provedores OAuth
```

Mas o APM SYN provavelmente precisará identificar o proprietário dos dados:

```text
User
 ├── Wallets
 ├── Websites
 ├── Transactions
 └── Goals
```

Eu faria algo conceitualmente assim:

```text
User
 ├── clerkId
 ├── createdAt
 └── dados próprios da aplicação
```

Não precisamos duplicar no MongoDB tudo que o Clerk já possui. O `User` do APM SYN seria mais um **perfil/identidade interna da aplicação**, vinculado ao usuário autenticado no Clerk.

---

### Wallet

Essa entidade ficou bem mais importante no SYN.

Sua definição atual me parece boa:

> Recebe valores provenientes de retiradas de websites registrados, transferências de outras wallets, ajustes e outras origens não registradas.

Eu só faria uma pequena mudança de perspectiva: a wallet não precisa necessariamente “guardar os valores recebidos” diretamente como registros independentes. Ela possui um **estado atual**, enquanto as transações contam a história de como chegou até esse estado.

Conceitualmente:

```text
Wallet
│
├── informações da carteira
│
├── posições atuais
│   ├── BTC → quantidade X → valor USD Y
│   ├── ETH → quantidade X → valor USD Y
│   └── USDT → quantidade X → valor USD Y
│
└── Transaction
    ├── depósitos
    ├── retiradas
    ├── transferências
    ├── ajustes
    └── entradas de websites
```

Aqui aparece uma possível subestrutura:

```text
WalletAsset
```

Mas atenção: eu **não a transformaria automaticamente em uma entidade MongoDB separada**.

Pode perfeitamente ser parte do documento da wallet:

```text
Wallet
 └── balances[]
       ├── asset
       ├── quantity
       └── usdValue
```

Ou seja, `WalletAsset` seria uma **subentidade/value object**, não necessariamente uma entidade independente.

---

### Website

Também está bem definida.

```text
Website
│
├── saldo de ganhos
│
└── operações
    ├── ganho
    └── retirada
```

A retirada é onde começa a integração:

```text
Website
   │
   │ Withdrawal
   │
   ├── asset
   ├── quantidade do asset
   ├── valor convertido em USD
   └── destinationWallet
```

E isso gera consequências na carteira.

Um ponto que considero importante registrar desde já: **o saldo do website provavelmente também deveria ser derivado das transações**, ou pelo menos mantido sincronizado a partir delas.

Exemplo:

```text
+ $20 ganho
+ $30 ganho
- $40 retirada
─────────────
$10 saldo
```

Assim evitamos ter dois lugares independentes tentando representar a mesma verdade.

---

### Transaction

Aqui está, na minha opinião, a entidade mais importante do APM SYN. O verdadeiro protagonista da temporada. 😄

Sua definição:

> representa o que aconteceu com quantia ganho/retirada do website, adição, retirada, transferência e ajuste na carteira

Eu concordo, mas acho que precisamos tomar cuidado para ela não virar uma entidade gigantesca tentando representar tudo sem uma estrutura clara.

Poderíamos começar com algo conceitual assim:

```text
Transaction
│
├── type
│   ├── WEBSITE_EARNING
│   ├── WEBSITE_WITHDRAWAL
│   ├── WALLET_DEPOSIT
│   ├── WALLET_WITHDRAWAL
│   ├── WALLET_TRANSFER
│   └── WALLET_ADJUSTMENT
│
├── amount
├── asset
├── usdValue
├── date
├── description
│
├── source
└── destination
```

Por exemplo, uma retirada:

```text
Transaction
type: WEBSITE_WITHDRAWAL

source:
  website: Site X

destination:
  wallet: Binance

asset: USDT
quantity: 100
usdValue: 100
```

Uma transferência:

```text
Transaction
type: WALLET_TRANSFER

source:
  wallet: Binance

destination:
  wallet: Trust Wallet

asset: BTC
quantity: 0.005
usdValue: 300
```

Isso pode ser uma estrutura extremamente poderosa porque a transação passa a representar **um evento**, e não apenas “uma alteração de saldo”.

Mas ainda não precisamos fechar o modelo agora. Na etapa 3, quando definirmos relacionamentos, isso vai ficar bem mais claro.

---

### Goals

Aqui eu manteria definitivamente como entidade própria.

E o seu modelo do APM Lite ajuda bastante a entender o domínio. A meta possui:

```text
Goal
│
├── configuração
│   ├── nome
│   ├── período
│   ├── status
│   └── distribuição
│
├── wallets participantes
│
├── metas por wallet
│
├── metas diárias
│
└── snapshot quando arquivada
```

A mudança mais importante no SYN será a relação dela com `Transaction`.

No APM Lite, aparentemente o sistema analisa os depósitos nas wallets.

No SYN podemos ter algo mais explícito:

```text
Transaction
│
├── ...
└── countsTowardGoal: true | false
```

Então:

```text
Depósito $100
Wallet: Binance
CountsTowardGoal: true
```

Entra no progresso.

Mas:

```text
Depósito $500
Wallet: Binance
CountsTowardGoal: false
```

Entra na wallet normalmente, mas **não entra na meta**.

Isso traduz exatamente a regra que você explicou.

E uma coisa boa dessa abordagem é que **a Goal não precisa guardar uma lista própria de depósitos ativos**. Ela pode calcular o progresso consultando as transactions elegíveis.

Algo como:

```text
Goal
   │
   ├── wallets elegíveis
   │
   └── consulta
         │
         ▼
Transactions
WHERE
  wallet ∈ goal.wallets
  AND countsTowardGoal = true
  AND date BETWEEN startDate AND endDate
```

O `snapshot` continua fazendo sentido quando a meta for arquivada, porque preserva o resultado histórico.

---

## Sobre Asset não ser entidade

Concordo com você.

Eu classificaria `Asset` como um **recurso de referência externo**, vindo da API.

```text
API externa
    │
    ▼
Asset catalog
    │
    ├── Bitcoin
    ├── Ethereum
    ├── USDT
    └── ...
```

O APM SYN usa essas informações nas transações e wallets, mas não precisa permitir:

```text
criar asset
editar asset
excluir asset
```

E isso elimina completamente o antigo módulo CRUD de Assets.

Mas existe uma observação importante: mesmo não sendo uma entidade, **precisaremos armazenar uma identificação suficiente do asset dentro das operações**.

Por exemplo:

```text
asset:
  externalId
  symbol
  name
```

Porque uma API externa pode mudar, ficar indisponível ou até alterar dados. Uma transação histórica não deveria “perder sua identidade” porque a API decidiu trocar alguma coisa.

Podemos decidir o nível exato dessa cópia de dados quando chegarmos ao modelo MongoDB.

---

### Minha lista consolidada de entidades

[[APM SYN - lista consolidada de entidades]]
Neste momento, eu registraria assim:

```text
APM SYN
│
├── User
│   └── proprietário dos dados no sistema
│
├── Wallet
│   └── local que possui múltiplos assets e seus saldos
│
├── Website
│   └── fonte de ganhos e retiradas
│
├── Transaction
│   └── registro dos eventos financeiros e movimentações
│
└── Goal
    └── meta financeira baseada em depósitos elegíveis
```

E fora das entidades persistidas:

```text
Asset
│
└── catálogo externo consumido por API
```

Eu acrescentaria ainda uma distinção que será útil nas próximas etapas:

```text
Entidades
├── User
├── Wallet
├── Website
├── Transaction
└── Goal

Value Objects / estruturas internas
├── AssetReference
├── WalletBalance
├── TransactionSource
├── TransactionDestination
├── GoalWalletConfig
├── GoalDay
└── GoalSnapshot
```

Isso é conceitual; não significa que cada item terá uma collection no MongoDB. Muito pelo contrário — vários deles provavelmente ficarão embutidos nos documentos.
