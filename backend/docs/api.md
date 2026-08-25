Perfeito. Agora sim vale transformar tudo o que decidimos em uma **especificação completa da API**, incluindo endpoints, payloads, respostas e regras. Mantive exatamente a estrutura que você definiu para facilitar a comparação seção por seção.

# APM SYN — API

## 1. Princípios

A API do APM SYN é uma REST API responsável por fornecer acesso aos dados e operações do sistema.

A API é dividida entre:

- recursos persistidos;
- operações de domínio;
- consultas derivadas;
- integrações externas.

### 1.1 Arquitetura

```
React
  ↓
TanStack Query
  ↓
REST API
  ↓
Express
  ↓
Services
  ↓
Repositories
  ↓
MongoDB
```

### 1.2 Versionamento

A API utiliza versionamento explícito:

```
/api/v1
```

Exemplo:

```
GET /api/v1/wallets
```

Uma nova versão será criada quando houver alteração incompatível com clientes existentes.

### 1.3 JSON

Requests e responses utilizam JSON.

```
Content-Type: application/json
```

### 1.4 Fonte da verdade

`Transaction` é a fonte da verdade financeira.

Wallets, Websites, Portfolio e Goals derivam seus dados financeiros das Transactions.

### 1.5 Operações financeiras

Operações financeiras não alteram diretamente saldos.

Exemplo:

```
POST /wallets/:id/deposits
        ↓
Transaction
        ↓
Wallet/Portfolio/Goal refletem o resultado
```

### 1.6 Isolamento de dados

Todo recurso pertence a um usuário.

A API nunca deve permitir que um usuário acesse ou modifique dados pertencentes a outro usuário.

### 1.7 Transações atômicas

Operações que produzem múltiplos efeitos devem ser executadas atomicamente.

Uma retirada de Website, por exemplo, deve criar todos os efeitos necessários ou nenhum deles.

---

# 2. Autenticação

A autenticação é responsabilidade do Clerk.

A API recebe a identidade autenticada e determina o `User` interno correspondente.

### 2.1 Autenticação

As rotas protegidas exigem uma sessão válida do Clerk.

```
Authorization: Bearer <token>
```

O backend valida o token antes de executar a operação.

### 2.2 User interno

O usuário autenticado pelo Clerk possui uma representação interna no APM SYN:

```
Clerk User
    ↓
clerkId
    ↓
APM SYN User
```

### 2.3 Sincronização

```
POST /api/v1/users/sync
```

Cria ou sincroniza o perfil interno.

A operação deve ser idempotente.

### 2.4 Perfil

```
GET /api/v1/users/me
```

Obtém o perfil do usuário autenticado.

```
PATCH /api/v1/users/me
```

Atualiza dados internos permitidos do perfil.

### 2.5 Exclusão

```
DELETE /api/v1/users/me
```

Solicita a exclusão dos dados do usuário no APM SYN.

A exclusão da identidade no Clerk deve seguir a política definida pela aplicação.

### 2.6 Autenticação fornecida pelo Clerk

Não fazem parte da API de domínio do APM SYN:

```
login
logout
change password
reset password
session management
```

Essas operações são fornecidas pelo Clerk.

---

# 3. Convenções

## 3.1 Base URL

```
/api/v1
```

## 3.2 Recursos

Os recursos utilizam nomes no plural:

```
/users
/wallets
/websites
/transactions
/goals
```

## 3.3 IDs

IDs retornados pela API representam os identificadores dos documentos MongoDB.

O cliente não deve assumir o formato interno do ID.

## 3.4 Datas

Datas devem utilizar ISO 8601.

Exemplo:

```
2026-08-23T15:30:00.000Z
```

## 3.5 Timestamps

Recursos persistidos possuem:

```
{
  "createdAt": "...",
  "updatedAt": "..."
}
```

## 3.6 Valores

Valores financeiros são representados como números.

```
{
  "usdValue": 150.25
}
```

A moeda de referência do APM SYN é USD.

## 3.7 Assets

Assets são identificados por referência ao catálogo externo.

Exemplo:

```
{
  "externalId": "tether",
  "symbol": "USDT",
  "name": "Tether"
}
```

O identificador externo deve ser preservado para garantir a identidade histórica do asset.

## 3.8 Status HTTP

A API utiliza os códigos HTTP convencionais:

```
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

---

# 4. Users

O recurso User representa o usuário interno da aplicação.

A autenticação permanece sob responsabilidade do Clerk.

## 4.1 Sincronizar perfil

```
POST /api/v1/users/sync
```

Cria o usuário interno caso ainda não exista ou sincroniza informações permitidas.

### Response

```
{
  "data": {
    "id": "user123",
    "clerkId": "clerk_123",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## 4.2 Obter perfil

```
GET /api/v1/users/me
```

## 4.3 Atualizar perfil

```
PATCH /api/v1/users/me
```

### Request

```
{
  "name": "Hedi Mauro"
}
```

## 4.4 Excluir dados

```
DELETE /api/v1/users/me
```

A operação deve remover ou anonimizar os dados pertencentes ao usuário conforme a política de retenção definida.

## 4.5 Exportar backup

```
GET /api/v1/users/me/backup
```

O backup deve conter uma versão explícita do formato.

Exemplo:

```
{
  "version": "1.0",
  "exportedAt": "...",
  "data": {
    "wallets": [],
    "websites": [],
    "transactions": [],
    "goals": []
  }
}
```

---

# 5. Wallets

## 5.1 Criar Wallet

```
POST /api/v1/wallets
```

### Request

```
{
  "name": "Binance",
  "type": "exchange",
  "color": "#...",
  "description": "Minha carteira principal"
}
```

### Response

```
201 Created
```

```
{
  "data": {
    "id": "wallet123",
    "name": "Binance",
    "type": "exchange",
    "status": "active",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## 5.2 Listar Wallets

```
GET /api/v1/wallets
```

Suporta paginação, filtering e sorting.

## 5.3 Consultar Wallet

```
GET /api/v1/wallets/:walletId
```

A resposta pode incluir o estado financeiro derivado:

```
{
  "data": {
    "id": "wallet123",
    "name": "Binance",
    "status": "active",
    "balances": [
      {
        "asset": {
          "externalId": "tether",
          "symbol": "USDT",
          "name": "Tether"
        },
        "quantity": 100,
        "usdValue": 100
      }
    ]
  }
}
```

`balances` é um dado derivado, não a fonte da verdade.

## 5.4 Editar Wallet

```
PATCH /api/v1/wallets/:walletId
```

Pode alterar dados administrativos da wallet.

Não altera diretamente saldos.

## 5.5 Desativar Wallet

```
POST /api/v1/wallets/:walletId/deactivate
```

Desativa temporariamente a Wallet. Transita `active → inactive`. Operação idempotente se já `inactive`. Wallet `archived` não pode ser desativada: retorna `409 WALLET_ARCHIVED`.

## 5.6 Reativar Wallet

```
POST /api/v1/wallets/:walletId/activate
```

Reativa Wallet `inactive → active`. Idempotente se já `active`. Wallet `archived` não pode ser reativada: retorna `409 WALLET_ARCHIVED` (arquivamento é irreversível).

## 5.7 Arquivar Wallet

```
POST /api/v1/wallets/:walletId/archive
```

Arquiva a Wallet: `active|inactive → archived`. Irreversível. Operações subsequentes em `archived` (update, deactivate, activate, delete com histórico) retornam `409 WALLET_ARCHIVED`. Filtro `?status=active|inactive|archived` reflete os três estados.

### 5.7.1 Ciclo de vida de status

```
active ──deactivate──▶ inactive ──activate──▶ active
  │                       │
  └──────archive──────────┴──▶ archived (terminal, irreversível)
active ──archive──▶ archived
```

Regras:
- `active`: operacional, aceita CRUD e futuras operações financeiras
- `inactive`: temporariamente desativada, ainda lista, mas `PATCH /:id` em `archived` falha `409` (em `inactive` permite editar); wallet `archived` bloqueia `PATCH/DELETE(deactivate/activate)`
- `archived`: encerrada/histórica, não volta a `active` ou `inactive`

## 5.8 Excluir Wallet

```
DELETE /api/v1/wallets/:walletId
```

A exclusão definitiva só é permitida quando não comprometer o histórico financeiro.

## 5.9 Depositar em Wallet

```
POST /api/v1/wallets/:walletId/deposits
```

> **Fase 7:** `countsTowardGoal` `true|false` default `false`; asset validação estrutural apenas; wallet deve estar `active` senão `409 WALLET_INACTIVE`/`WALLET_ARCHIVED`.

### Request

```
{
  "asset": {
    "externalId": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin"
  },
  "quantity": 0.01,
  "usdValue": 650,
  "date": "2026-08-23T10:00:00.000Z",
  "countsTowardGoal": true,
  "description": "Depósito externo"
}
```

Cria:

```
EXTERNAL → WALLET
```

e gera uma Transaction.

## 5.10 Retirar da Wallet

```
POST /api/v1/wallets/:walletId/withdrawals
```

> **Fase 7:** `countsTowardGoal` sempre `false` (ignorado); `quantity` validada contra saldo derivado `(walletId, asset.externalId)` → `422 INSUFFICIENT_BALANCE` se exceder; `active` obrigatório.

### Request

```
{
  "asset": {
    "externalId": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin"
  },
  "quantity": 0.005,
  "usdValue": 325,
  "date": "2026-08-23T10:00:00.000Z",
  "description": "Retirada"
}
```

Cria:

```
WALLET → EXTERNAL
```

## 5.11 Transferir entre Wallets

```
POST /api/v1/wallet-transfers
```

> **Fase 7:** route de primeiro nível `POST /wallet-transfers`; valida `sourceWalletId ≠ destinationWalletId` (self → `422`), ambos `active`, ownership, `countsTowardGoal` sempre `false`, saldo insuficiente `422 INSUFFICIENT_BALANCE`.

### Request

```
{
  "sourceWalletId": "wallet123",
  "destinationWalletId": "wallet456",
  "asset": {
    "externalId": "tether",
    "symbol": "USDT",
    "name": "Tether"
  },
  "quantity": 100,
  "usdValue": 100,
  "date": "2026-08-23T10:00:00.000Z",
  "description": "Transferência"
}
```

Cria:

```
WALLET → WALLET
```

Uma única Transaction representa a transferência.

## 5.12 Ajustar Wallet

```
POST /api/v1/wallets/:walletId/adjustments
```

> **Fase 7:** `direction: increase|decrease` mapeia para `EXTERNAL→WALLET` / `WALLET→EXTERNAL`; `increase` aceita `countsTowardGoal true|false` default `false`, `decrease` sempre `false`; `active` obrigatório, `inactive|archived` → `409`; saldo `decrease` validado via `INSUFFICIENT_BALANCE`.

### Request

```
{
  "asset": {
    "externalId": "tether",
    "symbol": "USDT",
    "name": "Tether"
  },
  "quantity": 10,
  "usdValue": 10,
  "direction": "increase",
  "date": "2026-08-23T10:00:00.000Z",
  "description": "Correção de saldo"
}
```

Um ajuste positivo representa:

```
EXTERNAL → WALLET
```

Um ajuste negativo representa:

```
WALLET → EXTERNAL
```

---

# 6. Websites

## 6.1 Criar Website

```
POST /api/v1/websites
```

### Request

```
{
  "name": "Site X",
  "url": "https://example.com",
  "description": "Website de ganhos"
}
```

## 6.2 Listar Websites

```
GET /api/v1/websites
```

## 6.3 Consultar Website

```
GET /api/v1/websites/:websiteId
```

A resposta pode incluir o saldo financeiro derivado.

## 6.4 Editar Website

```
PATCH /api/v1/websites/:websiteId
```

## 6.5 Arquivar Website

```
POST /api/v1/websites/:websiteId/archive
```

Arquiva `active → archived` irreversível; `archived` idempotente. `PATCH` em `archived` retorna `409 WEBSITE_ARCHIVED`.

## 6.6 Excluir Website

```
DELETE /api/v1/websites/:websiteId
```

Delete permitido somente sem Transactions; se houver Transaction com `source.id` ou `destination.id = websiteId` → `409 WEBSITE_HAS_TRANSACTIONS` (usar `archive`).

## 6.7 Registrar ganho

```
POST /api/v1/websites/:websiteId/earnings
```

> **Fase 9:** `POST /:id/earnings` payload padronizado `{asset,quantity,usdValue,date,description?}` (sem alias `amount`); `quantity` é quantidade do asset, `usdValue` é valor histórico em USD (podem coincidir em stablecoins, mas não precisam). `countsTowardGoal` sempre `false` para earnings.

> **Fase 10:** também exige `Idempotency-Key: <UUID>` header (`422` se ausente/inválido), escopo `unique(userId,key)`, TTL 24h; `EXTERNAL→WEBSITE` e `WEBSITE→WALLET` são cada uma **uma única Transaction** (sem saldo manual); concorrência com `session/withTransaction`.

### Request

```
{
  "asset": { "externalId": "tether", "symbol": "USDT", "name": "Tether" },
  "quantity": 25,
  "usdValue": 25,
  "date": "2026-08-23T10:00:00.000Z",
  "description": "Ganhos do dia"
}
```

Para ganhos:

```
EXTERNAL → WEBSITE
```

Saldo `websiteAssetBalance` por `(websiteId, asset.externalId)` = Σ earnings − Σ withdrawals; `archived → 409 WEBSITE_ARCHIVED`.

## 6.8 Retirar do Website

```
POST /api/v1/websites/:websiteId/withdrawals
```

### Request

```
{
  "walletId": "wallet123",
  "asset": {
    "externalId": "tether",
    "symbol": "USDT",
    "name": "Tether"
  },
  "quantity": 100,
  "usdValue": 100,
  "date": "2026-08-23T10:00:00.000Z",
  "countsTowardGoal": true,
  "description": "Retirada"
}
```

Cria:

```
WEBSITE → WALLET
```

> **Fase 9:** `withdrawal` exige `Website active → 409 WEBSITE_ARCHIVED` se arquivado e `Wallet active` (`inactive→409 WALLET_INACTIVE`, `archived→409 WALLET_ARCHIVED`); valida `quantity>0`, asset estrutural, saldo `websiteAssetBalance` por `(websiteId, asset.externalId)` → `422 INSUFFICIENT_BALANCE` se `quantity > available`; `countsTowardGoal true|false` default `false` (earning sempre `false`); concorrência check-before-create igual Wallet.

> **Fase 10 SYN Core:** `POST /websites/:id/withdrawals` **exige header** `Idempotency-Key: <UUID v4>` (sem fallback body) → `422 IDEMPOTENCY_KEY_INVALID` se ausente/inválido; escopo `unique(userId, key)`, TTL 24h (`expiresAt` + TTL index); mesma key + mesmo payload → retorna `Transaction` original (idempotente, sem duplicar); mesma key + payload diferente → `409 IDEMPOTENCY_CONFLICT`; concorrência protegida via **MongoDB session `withTransaction`**: `saldo suficiente + criação Transaction + gravação IdempotencyKey` como unidade atômica, impedindo saldo negativo por race (`WEBSITE_EARNING`/`WEBSITE_WITHDRAWAL` única fonte, sem atualização manual de saldos; `Wallet`/`Website`/`Portfolio` são views derivadas).

Esta é uma das principais operações do APM SYN.

Uma única requisição deve produzir uma única operação financeira sincronizada.

---

# 7. Transactions

> **Decisões Fase 6:**
> - `POST /api/v1/transactions` existe como create genérico (infra), validando matriz `type ↔ source ↔ destination` (Fase 6: `EXTERNAL↔WALLET`, `WALLET↔WALLET`; `WEBSITE` só Fase 8).
> - `date` é o campo temporal oficial (sem `occurredAt`); `createdAt/updatedAt` são metadados.
> - `source/destination` são discriminated union: `WALLET/WEBSITE` exigem `id`, `EXTERNAL` proíbe `id`; toda referência `WALLET/WEBSITE` valida `existe + ownership`.
> - Filtros `?walletId=&websiteId=&asset=&type=&from=&to=&countsTowardGoal=` via `GET /transactions`; endpoints aninhados `GET /wallets/:id/transactions` não existem nesta fase.

Transactions representam o histórico financeiro do usuário.

Na Fase 6 a criação ocorre via `POST /transactions` genérico validado; a partir da Fase 7 as operações de domínio (`depositToWallet` etc.) delegarão ao mesmo TransactionService.

## 7.1 Consultar Transaction

```
GET /api/v1/transactions/:transactionId
```

## 7.2 Listar Transactions

```
GET /api/v1/transactions
```

## 7.3 Transactions de Wallet (futuro, não Fase 6)

```
GET /api/v1/wallets/:walletId/transactions
```
> Não implementado na Fase 6; usar `GET /api/v1/transactions?walletId=`.

## 7.4 Transactions de Website (futuro, Fase 8)

```
GET /api/v1/websites/:websiteId/transactions
```
> Não implementado na Fase 6; usar `GET /api/v1/transactions?websiteId=` a partir da Fase 8.

## 7.5 Editar Transaction

```
PATCH /api/v1/transactions/:transactionId
```

Campos editáveis (Fase 6): `quantity, usdValue, date, description, countsTowardGoal`. Imutáveis: `type, source, destination` (discriminated union: `EXTERNAL` sem `id`).

```
{
  "quantity": 110,
  "usdValue": 110,
  "date": "2026-08-24T10:00:00.000Z",
  "description": "Valor corrigido",
  "countsTowardGoal": false
}
```

Não podem ser alterados:

```
type
source
destination
```

O sistema deve recalcular todas as informações derivadas após a alteração.

## 7.6 Excluir Transaction

```
DELETE /api/v1/transactions/:transactionId
```

A exclusão deve remover seus efeitos derivados.

## 7.7 Tipos

```
WALLET_DEPOSIT
WALLET_WITHDRAWAL
WALLET_TRANSFER
WALLET_ADJUSTMENT
WEBSITE_EARNING
WEBSITE_WITHDRAWAL
```

---

# 8. Goals

## 8.1 Criar Goal

```
POST /api/v1/goals
```

### Request

```
{
  "name": "Meta semanal",
  "startDate": "2026-08-24",
  "endDate": "2026-08-30",
  "distributionType": "same",
  "totalWeeklyGoal": 100,
  "wallets": [
    {
      "walletId": "wallet123",
      "weeklyGoal": 50,
      "days": [
        {
          "date": "2026-08-24",
          "goal": 10
        }
      ]
    }
  ]
}
```

## 8.2 Listar Goals

```
GET /api/v1/goals
```

## 8.3 Consultar Goal

```
GET /api/v1/goals/:goalId
```

## 8.4 Editar Goal

```
PATCH /api/v1/goals/:goalId
```

Permitido enquanto a Goal estiver ativa.

## 8.5 Consultar progresso

```
GET /api/v1/goals/:goalId/progress
```

## 8.6 Calcular progresso

```
POST /api/v1/goals/:goalId/progress/recalculate
```

A operação recalcula o progresso com base nas Transactions elegíveis.

## 8.7 Transactions consideradas

```
GET /api/v1/goals/:goalId/deposits
```

Retorna as Transactions elegíveis utilizadas no cálculo.

## 8.8 Arquivar Goal

```
POST /api/v1/goals/:goalId/archive
```

O arquivamento:

1. calcula o progresso final;
2. gera o snapshot;
3. salva o snapshot;
4. altera o status para `archived`.

## 8.9 Consultar snapshot

```
GET /api/v1/goals/:goalId/snapshot
```

---

# 9. Portfolio

Portfolio não é uma entidade persistida.

É uma visão consolidada e derivada dos dados financeiros.

## 9.1 Resumo

```
GET /api/v1/portfolio
```

Exemplo:

```
{
  "data": {
    "totalUsdValue": 12500,
    "wallets": 3,
    "assets": 5
  }
}
```

## 9.2 Posições

```
GET /api/v1/portfolio/positions
```

Exemplo:

```
{
  "data": [
    {
      "asset": {
        "externalId": "bitcoin",
        "symbol": "BTC",
        "name": "Bitcoin"
      },
      "quantity": 0.15,
      "usdValue": 9750
    }
  ]
}
```

## 9.3 Distribuição por Wallet

```
GET /api/v1/portfolio/by-wallet
```

## 9.4 Distribuição por Asset

```
GET /api/v1/portfolio/by-asset
```

## 9.5 Histórico

```
GET /api/v1/portfolio/history
```

Permite consultar a evolução patrimonial ao longo do tempo.

---

# 10. Crypto Market Data

A fonte externa de dados de mercado será a CoinGecko API.

A CoinGecko oferece endpoints para preços, informações de moedas, dados históricos e dados de mercado. Para o nosso caso, os principais serão `simple/price`, `coins/markets`, `coins/list` e `coins/{id}/market_chart`. 

O APM SYN apenas consulta a CoinGecko quando precisa de informações de mercado.

```text
APM SYN
   │
   ▼
CoinGecko
   │
   ├── preço atual
   ├── variação
   ├── market cap
   └── dados históricos
```

## 10.1 Obter preço atual

Backend:

```http
GET /api/market/prices
```

Exemplo:

```http
GET /api/market/prices?ids=bitcoin,ethereum
```

O backend consulta a CoinGecko.

A CoinGecko possui o endpoint `GET /simple/price`, que permite consultar vários coins por seus IDs e retornar o preço em uma moeda de referência, como USD.

Resposta do APM:

```json
{
  "data": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "priceUsd": 77671,
      "change24h": -0.95,
      "lastUpdatedAt": "..."
    },
    {
      "id": "ethereum",
      "symbol": "ETH",
      "priceUsd": 3500,
      "change24h": 1.42,
      "lastUpdatedAt": "..."
    }
  ]
}
```

O frontend **não precisa conhecer o formato original da CoinGecko**.

## 10.2 Obter informações para o Portfolio

Endpoint interno:

```http
GET /api/portfolio
```

O backend:

```text
1. identifica o User
2. busca Wallets
3. identifica os assets presentes
4. consulta preços atuais
5. calcula valor atual
6. retorna o Portfolio
```

Exemplo:

```json
{
  "data": {
    "totalUsd": 12500,

    "assets": [
      {
        "symbol": "BTC",
        "quantity": 0.05,
        "priceUsd": 77000,
        "valueUsd": 3850,
        "percentage": 30.8
      },
      {
        "symbol": "USDT",
        "quantity": 5000,
        "priceUsd": 1,
        "valueUsd": 5000,
        "percentage": 40
      }
    ]
  }
}
```

Esse endpoint é do **APM SYN**, não da CoinGecko.

## 10.3 Dados de mercado

Quando necessário:

```http
GET /api/market/coins/:coinId
```

Pode retornar:

```text
price
marketCap
volume
24h change
ATH
ATL
etc.
```

A CoinGecko disponibiliza esses dados através de `/coins/markets` e `/coins/{id}`. 

## 10.4 Histórico de preço

Para gráficos:

```http
GET /api/market/coins/:coinId/chart
```

Parâmetros:

```text
days
```

Exemplo:

```http
GET /api/market/coins/bitcoin/chart?days=30
```

O backend pode utilizar:

```text
CoinGecko
/coins/{id}/market_chart
```

ou `/market_chart/range` quando for necessário especificar um intervalo. 

## 10.5 Busca de criptomoedas

Para o usuário selecionar uma criptomoeda:

```http
GET /api/market/search?q=bitcoin
```

O backend consulta a CoinGecko e retorna apenas os dados necessários para o seletor.

Exemplo:

```json
{
  "data": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "image": "..."
    }
  ]
}
```

Isso permite:

```text
Usuário
   ↓
Adicionar/selecionar crypto
   ↓
APM API
   ↓
CoinGecko
   ↓
Bitcoin / BTC
```

Sem criar uma entidade Asset no nosso banco.

## 10.6 API Key

A chave da CoinGecko deve existir **somente no backend**.

Nunca:

```text
Frontend
   ↓
COINGECKO_API_KEY
```

Correto:

```text
Frontend
   ↓
APM Backend
   ↓
COINGECKO_API_KEY
   ↓
CoinGecko
```

A documentação atual da CoinGecko diferencia as chaves Demo e Pro e os respectivos hosts/header de autenticação. 

---

## 10.7 Rate limit

O backend não deve consultar a CoinGecko desnecessariamente.

A API Demo atualmente possui limite de **100 chamadas/minuto**, enquanto os limites variam conforme o plano. 

Portanto, recomendamos:

```text
Frontend
   ↓
APM API
   ↓
cache
   ↓
CoinGecko somente quando necessário
```

O cache não transforma Asset em entidade do sistema.

É apenas uma otimização técnica para evitar chamadas repetidas.

---

## 10.8 Atualização de preços

Não devemos atualizar o MongoDB a cada consulta de preço.

O preço atual é:

```text
CoinGecko
    ↓
preço atual
    ↓
Portfolio
```

e não:

```text
CoinGecko
    ↓
MongoDB
    ↓
Portfolio
```

A menos que futuramente exista uma necessidade explícita de histórico próprio de preços.

# 11. Errors

Todas as respostas de erro seguem uma estrutura consistente.

```
{
  "error": {
    "code": "WALLET_NOT_FOUND",
    "message": "Wallet not found.",
    "details": null
  }
}
```

## 11.1 Validação

```
422 Unprocessable Entity
```

Exemplo:

```
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request.",
    "details": [
      {
        "field": "quantity",
        "message": "Must be greater than zero."
      }
    ]
  }
}
```

## 11.2 Não autenticado

```
401 Unauthorized
```

```
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required."
  }
}
```

## 11.3 Sem permissão

```
403 Forbidden
```

## 11.4 Recurso inexistente

```
404 Not Found
```

## 11.5 Conflito

```
409 Conflict
```

Usado para situações como:

- operação incompatível com estado atual;
- tentativa de excluir recurso com histórico protegido;
- wallet arquivada recebendo nova operação.

## 11.6 Regra de negócio

```
422 Unprocessable Entity
```

Exemplos:

```
INSUFFICIENT_BALANCE
INVALID_TRANSACTION
GOAL_ALREADY_ARCHIVED
WALLET_INACTIVE
WEBSITE_ARCHIVED
```

## 11.7 Serviço externo

```
502 Bad Gateway
```

ou:

```
503 Service Unavailable
```

quando o serviço de dados de mercado estiver indisponível.

---

# 12. Pagination

Endpoints de listagem devem suportar paginação.

A convenção inicial utiliza paginação baseada em página:

```
?page=1&limit=20
```

### Limites

```
page: mínimo 1
limit: mínimo 1
limit máximo: 100
```

### Response

```
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7
  }
}
```

A implementação pode migrar posteriormente para cursor pagination caso o volume de Transactions exija.

---

# 13. Filtering

Filtros são enviados como query parameters.

## 13.1 Transactions

```
GET /api/v1/transactions
```

Exemplos:

```
?type=WALLET_DEPOSIT
```

```
?walletId=wallet123
```

```
?websiteId=website123
```

```
?asset=bitcoin
```

```
?from=2026-08-01&to=2026-08-31
```

```
?countsTowardGoal=true
```

Filtros podem ser combinados.

## 13.2 Wallets

```
GET /api/v1/wallets?status=active
```

## 13.3 Websites

```
GET /api/v1/websites?status=active
```

## 13.4 Goals

```
GET /api/v1/goals?status=active
```

---

# 14. Sorting

Ordenação utiliza:

```
?sort=field
```

Ordenação descendente utiliza:

```
?sort=-field
```

## 14.1 Transactions

Exemplos:

```
?sort=-date
```

```
?sort=usdValue
```

Campos permitidos:

```
date
createdAt
usdValue
quantity
```

Ordenação padrão:

```
-date
```

## 14.2 Wallets

Campos:

```
name
createdAt
updatedAt
```

Padrão:

```
name
```

## 14.3 Websites

Campos:

```
name
createdAt
updatedAt
```

Padrão:

```
name
```

## 14.4 Goals

Campos:

```
startDate
endDate
createdAt
updatedAt
```

Padrão:

```
-startDate
```

---

# Resumo dos endpoints

```
USERS
POST   /api/v1/users/sync
GET    /api/v1/users/me
PATCH  /api/v1/users/me
DELETE /api/v1/users/me
GET    /api/v1/users/me/backup

WALLETS
POST   /api/v1/wallets
GET    /api/v1/wallets
GET    /api/v1/wallets/:id
PATCH  /api/v1/wallets/:id
POST   /api/v1/wallets/:id/activate
POST   /api/v1/wallets/:id/deactivate
POST   /api/v1/wallets/:id/archive
DELETE /api/v1/wallets/:id

POST   /api/v1/wallets/:id/deposits
POST   /api/v1/wallets/:id/withdrawals
POST   /api/v1/wallets/:id/adjustments
POST   /api/v1/wallet-transfers

WEBSITES
POST   /api/v1/websites
GET    /api/v1/websites
GET    /api/v1/websites/:id
PATCH  /api/v1/websites/:id
POST   /api/v1/websites/:id/archive
DELETE /api/v1/websites/:id

POST   /api/v1/websites/:id/earnings
POST   /api/v1/websites/:id/withdrawals

TRANSACTIONS (Fase 6)
POST   /api/v1/transactions
GET    /api/v1/transactions
GET    /api/v1/transactions/:id
PATCH  /api/v1/transactions/:id
DELETE /api/v1/transactions/:id
# Fase 6: filtros ?walletId=&websiteId=&asset=&type=&from=&to=&countsTowardGoal=&sort=&page=&limit=
# Fase 8+: GET /api/v1/wallets/:id/transactions , GET /api/v1/websites/:id/transactions (conveniência)

GOALS
POST   /api/v1/goals
GET    /api/v1/goals
GET    /api/v1/goals/:id
PATCH  /api/v1/goals/:id
POST   /api/v1/goals/:id/archive
GET    /api/v1/goals/:id/progress
POST   /api/v1/goals/:id/progress/recalculate
GET    /api/v1/goals/:id/deposits
GET    /api/v1/goals/:id/snapshot

PORTFOLIO
GET    /api/v1/portfolio
GET    /api/v1/portfolio/positions
GET    /api/v1/portfolio/by-wallet
GET    /api/v1/portfolio/by-asset
GET    /api/v1/portfolio/history

MARKET DATA
GET    /api/v1/market/assets
GET    /api/v1/market/assets/search
GET    /api/v1/market/assets/:id
GET    /api/v1/market/assets/:id/price
GET    /api/v1/market/assets/:id/convert
```

## Princípio arquitetural final

A API deve fazer uma distinção clara entre **CRUD** e **comandos de domínio**.

```
CRUD
│
├── Wallet
├── Website
├── Goal
└── User

COMANDOS FINANCEIROS
│
├── depositToWallet
├── withdrawFromWallet
├── transferBetweenWallets
├── adjustWallet
├── recordEarning
└── withdrawFromWebsite

HISTÓRICO
│
└── Transaction

CONSULTAS DERIVADAS
│
└── Portfolio

DADOS EXTERNOS
│
└── Crypto Market Data
```

A regra mais importante continua sendo:

```
Operação de domínio
       ↓
Transaction
       ↓
efeitos derivados
       ├── Wallet
       ├── Website
       ├── Portfolio
       └── Goal
```
