# APM SYN - Definir o que muda do APM Lite para o SYN

Definido com muito mais clareza **o que realmente é o APM SYN**. E tem uma mudança conceitual importante aqui: ele **não elimina as operações manuais**, ele elimina principalmente a **duplicação manual de uma mesma operação**.

### APM Lite → modelo atual

No APM Lite, os três módulos principais funcionam praticamente de forma independente:

```text
Website ───────────────┐
                       │
Wallets ───────────────┼── operações separadas
                       │
Assets ────────────────┘
```

Exemplo de retirada:

```text
1. Registrar retirada no Website
          ↓
2. Ir para Wallets
          ↓
3. Adicionar manualmente a transação em USD
          ↓
4. Ir para Assets
          ↓
5. Adicionar manualmente o asset recebido
```

Ou seja, existe uma relação lógica entre essas ações, mas o sistema não conhece essa relação.

---

### APM SYN → novo modelo

Aqui a retirada passa a ser uma operação centralizada:

```text
Website
   │
   │ Retirada
   │
   ├── valor
   ├── carteira
   └── asset
          │
          ▼
   Sistema sincroniza automaticamente
          │
          ├── Website → registra a retirada
          ├── Wallet → recebe a movimentação correspondente
          └── Assets → reflete o asset recebido
```

O usuário faz **uma ação**, e o sistema executa as consequências relacionadas. É exatamente aí que mora o `SYN` do APM SYN. 😎

### O que permanece manual

Isso é importante registrar para não criarmos uma ideia errada de automação total.

Continua sendo possível:

**Wallets**

- adicionar carteira;
- adicionar transações manualmente;
- mas apenas quando a transação **não tiver origem em uma retirada de um website cadastrado**.

**Websites**

- adicionar website;
- adicionar ganhos manualmente;
- iniciar/registrar retiradas manualmente.

Ou seja:

```text
Transação manual comum
        ↓
      Wallet
```

Mas:

```text
Retirada de Website
        ↓
Website + Wallet + Asset
```

São dois tipos conceitualmente diferentes de operação.

---

### Assets: a maior mudança

Aqui eu faria uma correção importante na nossa arquitetura anterior.

Pelo que você explicou, aparentemente o APM SYN **não terá mais um módulo de Assets independente como existe no APM Lite**.

Antes:

```text
Assets
 ├── adicionar asset
 ├── editar asset
 ├── adicionar transação
 ├── editar transação
 └── remover transação
```

Agora:

```text
Assets
 └── são obtidos por uma API externa
```

E, durante uma retirada:

```text
Retirada
 ├── Valor
 ├── Carteira
 └── Asset ← selecionado a partir da API
```

Portanto, não devemos criar no MongoDB uma coleção `assets` simplesmente porque ela existia no APM Lite.

O asset pode ser uma **referência a um catálogo externo**, enquanto o que pertence ao usuário é a sua **posição daquele asset**.

Por exemplo:

```text
Catálogo externo
       │
       ├── Bitcoin
       ├── Ethereum
       ├── Solana
       └── USDT
              │
              ▼
          APM SYN
              │
              └── Holdings / posições do usuário
                    │
                    ├── BTC na Binance
                    ├── USDT na Trust Wallet
                    └── ETH na MetaMask
```

Essa diferença é bem importante.

---

### Wallets também mudam conceitualmente

Essa mudança que você mencionou é grande:

> Atualmente a wallet só permite transações em dólar. Agora terá que permitir outros assets.

Então precisamos abandonar o conceito:

```text
Wallet
 └── balance: USD
```

E pensar mais em:

```text
Wallet
 ├── USD
 ├── BTC
 ├── ETH
 └── USDT
```

Ou, conceitualmente:

```text
Wallet
    │
    └── Balances
          ├── USD → 250.00
          ├── BTC → 0.005
          └── USDT → 100.00
```

Isso significa que uma wallet deixa de ser apenas um recipiente de dólares e passa a armazenar **múltiplos ativos**.

Exemplo:

```text
Binance
 ├── 250 USD
 ├── 0.002 BTC
 └── 100 USDT
```

A retirada do website pode então gerar:

```text
Website
   │
   │ retirada: $100
   │ asset: USDT
   ▼
Binance
   │
   └── +100 USDT
```

Aqui teremos que definir posteriormente uma coisa importante: **o valor informado na retirada representa quantidade do asset ou valor em dólar?**

Por exemplo, se você informa:

```text
$100
Asset: BTC
```

O sistema precisa saber se isso significa:

```text
100 USD em valor de BTC
```

ou:

```text
100 BTC
```

Imagino que seja a primeira opção, mas vale deixar essa regra explicitamente definida quando chegarmos às operações.

---

### Comparação consolidada

| Funcionalidade                       | APM Lite     | APM SYN         |
| ------------------------------------ | ------------ | --------------- |
| Adicionar wallet                     | Manual       | Manual          |
| Transação manual em wallet           | Sim          | Sim, com regras |
| Wallet suporta apenas USD            | Sim          | Não             |
| Wallet suporta assets                | Não          | Sim             |
| Adicionar assets manualmente         | Sim          | Não             |
| Catálogo de assets                   | Local/manual | API externa     |
| Transação manual de asset            | Sim          | Não             |
| Website                              | Sim          | Sim             |
| Ganhos no website                    | Manual       | Manual          |
| Retirada do website                  | Manual       | Manual          |
| Atualizar wallet após retirada       | Manual       | Automático      |
| Atualizar posição do asset           | Manual       | Automático      |
| Assets/Walets/Websites independentes | Sim          | Não totalmente  |
| Login/Signup                         | Não          | Sim             |
| Sincronização entre módulos          | Não          | Sim             |

Eu acrescentaria ainda uma mudança que está **implícita** no que você descreveu:

### Origem das transações

No APM SYN, uma movimentação provavelmente precisará saber **de onde veio**.

Algo conceitual como:

```text
Transaction
 ├── MANUAL
 └── WEBSITE_WITHDRAWAL
```

Assim, quando uma retirada criar automaticamente uma movimentação na carteira, ela não será confundida com uma transação que o usuário adicionou diretamente.

Isso será muito útil para edição e exclusão.

Exemplo:

```text
Website Withdrawal #123
          │
          └── gera
                │
                └── Wallet Movement #456
                     source: WEBSITE_WITHDRAWAL
                     sourceId: #123
```

Se o usuário editar a retirada, o sistema sabe exatamente qual movimentação sincronizada precisa ser atualizada.

Se excluir:

```text
Excluir retirada
       ↓
Localizar movimentos vinculados
       ↓
Reverter/remover efeitos
```

💡 **Minha leitura atual:** o APM SYN não terá mais três sistemas independentes. Ele continuará tendo as áreas **Websites**, **Wallets** e talvez uma visualização de **Assets**, mas o backend passará a tratá-las como partes de um mesmo sistema de movimentação.

E uma observação importante: eu **não fecharia ainda** a decisão de eliminar completamente a página Assets. Você disse que “já não haverá todos os modais relacionados aos assets”, o que confirma que o fluxo de cadastro/transações manuais muda, mas ainda podemos ter uma página de Assets para **visualizar as posições sincronizadas** — sem modais de CRUD. Algo como:

```text
Assets
 ├── BTC
 │    ├── Binance → 0.005 BTC
 │    └── MetaMask → 0.001 BTC
 │
 └── USDT
      └── Binance → 100 USDT
```

Isso preservaria uma das funções mais úteis do APM Lite, mas agora como **resultado das operações**, não como um módulo independente que o usuário precisa alimentar manualmente.
