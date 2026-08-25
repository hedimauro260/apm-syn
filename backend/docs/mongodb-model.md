# APM SYN - Modelo MongoDB

**5 collections principais**:

```text
users
wallets
websites
transactions
goals
```

E **nenhuma collection `assets`**. Assets continuam sendo referências de um catálogo externo.

## 1. `users`

Como o Clerk cuida da autenticação, essa collection existe apenas para os dados internos do APM SYN.

```ts
interface User {
  _id: ObjectId;

  clerkId: string;

  createdAt: Date;
  updatedAt: Date;
}
```

Eu manteria propositalmente simples.

Se futuramente você adicionar preferências da aplicação:

```ts
interface User {
  _id: ObjectId;

  clerkId: string;

  preferences?: {
    currency?: "USD";
    theme?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

**Índice obrigatório:**

```text
clerkId → unique
```

---

## 2. `wallets`

A wallet representa a carteira e sua configuração, mas **não deve manter o saldo como fonte da verdade**.

Minha proposta:

```ts
interface Wallet {
  _id: ObjectId;

  userId: ObjectId;

  name: string;
  type: WalletType;

  status: "active" | "inactive" | "archived";

  color?: string;
  description?: string;

  createdAt: Date;
  updatedAt: Date;
}
```

Repare que eu **não colocaria**:

```ts
balance: number;
```

Nem:

```ts
assets: [];
```

Como fonte oficial.

Isso porque já definimos:

> Transactions são a fonte da verdade financeira.

A composição da carteira seria obtida conceitualmente por:

```text
transactions
     ↓
agrupadas por
     ↓
walletId + asset
     ↓
posição atual
```

Por exemplo:

```text
Binance

BTC  → 0.015
ETH  → 2.4
USDT → 850
```

### Índices

```text
userId + status
userId + name
```

---

# 3. `websites`

Mesma filosofia: o documento guarda a identidade/configuração; as transactions contam a história financeira.

```ts
interface Website {
  _id: ObjectId;

  userId: ObjectId;

  name: string; // unique(userId, name)

  url?: string; // opcional, quando informada deve ser http/https, trim
  description?: string;

  status: "active" | "archived"; // sem inactive; active→archived irreversível

  createdAt: Date;
  updatedAt: Date;
}
```

> **Fase 8:** `status` apenas `active|archived` (sem `inactive`), `url` opcional mas valida `http/https`, `name` único por `userId` (`unique(userId,name)` → `409 WEBSITE_NAME_ALREADY_EXISTS`), filtros `?status=active|archived`, sorting default `name ASC` em `name,createdAt,updatedAt`, `DELETE` somente sem Transactions senão `409 WEBSITE_HAS_TRANSACTIONS`.

Também não colocaria:

```ts
balance: number;
```

como fonte da verdade.

O saldo seria determinado pelas transactions:

```text
EXTERNAL → WEBSITE
     +
WEBSITE → WALLET
     ↓
saldo atual
```

### Índices

```text
userId + status
userId + name
```

---

# 4. `transactions`

> **Decisões Fase 6 (oficiais):**
> 1. `POST /api/v1/transactions` existe desde a Fase 6 como create genérico, mas validando matriz `type ↔ source ↔ destination` centralizada.
> 2. Toda referência `WALLET/WEBSITE` em `source/destination` deve ser validada: `ObjectId válido → existe → pertence ao User` (EXTERNAL não tem `id`).
> 3. Campo temporal oficial é `date` (quando o evento aconteceu); `createdAt/updatedAt` são metadados do registro. Não existe `occurredAt`.
> 4. `source/destination` usam discriminated union: `WALLET`/`WEBSITE` exigem `id`, `EXTERNAL` proíbe `id`.
> 5. Fase 6 implementa apenas `EXTERNAL↔WALLET` e `WALLET↔WALLET`; combinações `WEBSITE` ficam para Fase 8 (sem stub).
> 6. Filtros por wallet/website são `GET /transactions?walletId=&websiteId=`; endpoint aninhado `GET /wallets/:id/transactions` não existe nesta fase.

Essa é a collection mais importante do projeto.

Minha sugestão é usar **um documento único e genérico para todos os eventos financeiros**, mas com uma estrutura rigidamente validada pelo `type`.

```ts
type TransactionType =
  | "WALLET_DEPOSIT"
  | "WALLET_WITHDRAWAL"
  | "WALLET_TRANSFER"
  | "WALLET_ADJUSTMENT"
  | "WEBSITE_EARNING"
  | "WEBSITE_WITHDRAWAL";
```

Os participantes:

```ts
type ParticipantType = "WALLET" | "WEBSITE" | "EXTERNAL";
```

E o documento:

```ts
interface Transaction {
  _id: ObjectId;

  userId: ObjectId;

  type: TransactionType;

  source: {
    type: ParticipantType;
    id?: ObjectId;
  };

  destination: {
    type: ParticipantType;
    id?: ObjectId;
  };

  asset: {
    externalId: string;
    symbol: string;
    name: string;
  };

  quantity: number;

  usdValue: number;

  countsTowardGoal: boolean;

  date: Date;

  description?: string;

  createdAt: Date;
  updatedAt: Date;
}
```

### Exemplos

**Depósito manual:**

```text
EXTERNAL → WALLET
```

```ts
{
  type: "WALLET_DEPOSIT",

  source: {
    type: "EXTERNAL"
  },

  destination: {
    type: "WALLET",
    id: walletId
  },

  asset: {
    externalId: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin"
  },

  quantity: 0.01,
  usdValue: 650,
  countsTowardGoal: true
}
```

**Transferência:**

```text
WALLET → WALLET
```

```ts
{
  type: "WALLET_TRANSFER",

  source: {
    type: "WALLET",
    id: walletA
  },

  destination: {
    type: "WALLET",
    id: walletB
  },

  asset: {
    externalId: "ethereum",
    symbol: "ETH",
    name: "Ethereum"
  },

  quantity: 1,
  usdValue: 3500,
  countsTowardGoal: false
}
```

**Ganho no Website:**

```text
EXTERNAL → WEBSITE
```

```ts
{
  type: "WEBSITE_EARNING",

  source: {
    type: "EXTERNAL"
  },

  destination: {
    type: "WEBSITE",
    id: websiteId
  },

  asset: {
    externalId: "usd",
    symbol: "USD",
    name: "US Dollar"
  },

  quantity: 100,
  usdValue: 100,
  countsTowardGoal: false
}
```

**Retirada de Website:**

```text
WEBSITE → WALLET
```

```ts
{
  type: "WEBSITE_WITHDRAWAL",

  source: {
    type: "WEBSITE",
    id: websiteId
  },

  destination: {
    type: "WALLET",
    id: walletId
  },

  asset: {
    externalId: "tether",
    symbol: "USDT",
    name: "Tether"
  },

  quantity: 100,
  usdValue: 100,
  countsTowardGoal: true
}
```

### Índices importantes

```text
userId + date
userId + type
userId + source.type + source.id
userId + destination.type + destination.id
```

> **Fase 9:** `WEBSITE_EARNING` `EXTERNAL→WEBSITE` (`asset,quantity,usdValue,date`, `countsTowardGoal=false`) e `WEBSITE_WITHDRAWAL` `WEBSITE→WALLET` (`walletId,asset,quantity,usdValue,date,countsTowardGoal default false`); saldo `websiteId+asset` = Σ earnings − Σ withdrawals → `422` se insuficiente; wallet `inactive/archived` e website `archived` bloqueiam.

Isso permitirá consultar rapidamente o histórico de uma Wallet ou Website.

---

## 5. `goals`

Aqui eu manteria boa parte do conceito que você já tinha no APM Lite.

```ts
type GoalStatus = "active" | "archived";

type DistributionType = "same" | "custom";

interface GoalDay {
  date: string;
  goal: number;
}

interface GoalWalletConfig {
  walletId: ObjectId;

  weeklyGoal: number;

  days: GoalDay[];
}
```

O documento:

```ts
interface Goal {
  _id: ObjectId;

  userId: ObjectId;

  name: string;

  status: GoalStatus;

  startDate: Date;
  endDate: Date;

  distributionType: DistributionType;

  totalWeeklyGoal: number;

  wallets: GoalWalletConfig[];

  archivedAt?: Date;

  snapshot?: GoalSnapshot;

  createdAt: Date;
  updatedAt: Date;
}
```

Eu manteria o `snapshot` **embutido no documento**, exatamente porque ele pertence exclusivamente àquela Goal e não precisa ser consultado independentemente.

A estrutura poderia continuar próxima da atual:

```ts
interface GoalSnapshot {
  archivedAt: Date;

  totalWeeklyGoal: number;
  totalWeeklyProgress: number;

  remaining: number;
  percentage: number;

  status: GoalProgressStatus;

  streak: number;

  bestWallet: GoalSnapshotBestWallet | null;

  walletProgress: GoalSnapshotWalletProgress[];

  days: GoalSnapshotDay[];

  deposits: GoalSnapshotDeposit[];
}
```

Só faria uma mudança:

```ts
interface GoalSnapshotDeposit {
  transactionId: ObjectId;

  amount: number;
  date: Date;

  walletName: string;

  description?: string;
}
```

O snapshot pode guardar dados como `walletName` e `amount` duplicados intencionalmente, porque ele representa uma **fotografia histórica**.

---

# Visão geral

```text
MongoDB
│
├── users
│   └── clerkId
│
├── wallets
│   └── userId
│
├── websites
│   └── userId
│
├── transactions
│   ├── userId
│   ├── source
│   └── destination
│
└── goals
    ├── userId
    ├── wallets[]
    └── snapshot
```

Os relacionamentos ficam:

```text
                  User
         ┌─────────┼─────────┐
         │         │         │
         ▼         ▼         ▼
      Wallet    Website     Goal
         │         │
         │         │
         └────┬────┘
              │
              ▼
         Transaction
```

E `Asset`:

```text
External Asset API
        │
        ▼
Asset Reference
        │
        ▼
Transaction
```

## A única decisão da minha proposta que considero realmente importante

Eu **não criaria `balances[]` dentro da Wallet neste primeiro modelo**.

Se fizermos:

```ts
Wallet {
  balances: [...]
}
```

e também tivermos:

```ts
Transaction;
```

teremos duas representações do mesmo estado financeiro.

Isso cria o risco:

```text
Transaction criada ✅
balances atualizado ❌
```

e pronto: sincronização quebrada, exatamente o fantasma que o APM SYN nasceu para exorcizar. 👻😂

Minha proposta mantém uma única fonte da verdade:

```text
Transaction
```

Wallet, Website, Assets e Goals são diferentes formas de interpretar essa história.

Mais tarde, se o desempenho exigir, podemos adicionar **projeções/cache de saldo**, mas deixando explicitamente claro que são dados derivados e reconstruíveis.

Então, minha proposta final para você comparar é: **5 collections, Assets externos sem collection própria, Transaction genérica como registro central e Wallet/Website sem saldos persistidos como fonte de verdade**.
