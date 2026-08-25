# APM SYN Frontend — Arquitetura e Roadmap

## 1. Objetivo

Esta documentação define a arquitetura técnica, a organização do código e o roadmap de desenvolvimento do frontend do APM SYN.

O frontend é responsável pela interface gráfica, navegação, formulários, apresentação de dados e comunicação com a API.

O frontend **não é responsável pelas regras financeiras do sistema**.

---

# 2. Stack

```text
React
TypeScript
Vite
Tailwind CSS 4
Clerk
React Router
TanStack Query
Zustand
Zod
```

### 2.1 Responsabilidades de cada tecnologia

```text
React            → Interface e componentes
TypeScript       → Tipagem estática
Vite             → Build e desenvolvimento
Tailwind CSS 4   → Estilização utility-first
Clerk            → Autenticação e sessão
React Router     → Navegação e rotas
TanStack Query   → Server state, cache, invalidação
Zustand          → Client/UI state
Zod              → Validação de entrada
```

---

# 3. Princípio fundamental

```text
Frontend → Interface
Backend  → Domínio e regras financeiras
```

O frontend apresenta dados e envia operações para a API.

O backend determina o resultado de todas as operações financeiras.

O frontend nunca deve:

```text
calcular saldo financeiro como fonte da verdade
criar Transactions diretamente
alterar múltiplas entidades para simular sincronização
acessar MongoDB
acessar diretamente a API de Market Data
implementar regras financeiras do domínio
```

---

# 4. Estrutura de diretórios

```text
frontend/
│
├── src/
│   │
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   └── layouts/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── wallets/
│   │   ├── websites/
│   │   ├── transactions/
│   │   ├── goals/
│   │   ├── portfolio/
│   │   └── market/
│   │
│   ├── pages/
│   │
│   ├── hooks/
│   │
│   ├── stores/
│   │
│   ├── services/
│   │   └── api/
│   │
│   ├── schemas/
│   │
│   ├── types/
│   │
│   ├── lib/
│   │
│   ├── utils/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│
├── docs/
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── ...
```

---

# 5. Organização por camada

## 5.1 `app/`

Responsável pela configuração estrutural da aplicação.

```text
app/
├── router/
├── providers/
└── layouts/
```

### `router/`

Define as rotas da aplicação.

```text
/dashboard
/wallets
/wallets/:walletId
/websites
/websites/:websiteId
/transactions
/transactions/:transactionId
/goals
/goals/:goalId
/portfolio
```

### `providers/`

Providers globais da aplicação.

```text
ClerkProvider
QueryClientProvider
ThemeProvider
RouterProvider
```

### `layouts/`

Layouts gerais.

```text
AppLayout
├── Sidebar
├── Header
└── Main Content

AuthLayout
├── Login
└── Register
```

---

## 5.2 `components/`

Componentes reutilizáveis.

```text
components/
├── ui/
├── layout/
└── shared/
```

### `ui/`

Componentes visuais genéricos, sem regras de domínio.

```text
Button
Input
Select
Modal
Table
Badge
Card
Dropdown
Skeleton
Alert
Dialog
Tabs
```

### `layout/`

Componentes estruturais de layout.

```text
Sidebar
Header
Navigation
PageContainer
Breadcrumbs
MobileNav
```

### `shared/`

Componentes reutilizáveis entre features com contexto da aplicação.

```text
ConfirmDialog
ErrorState
EmptyState
LoadingState
AssetSelector
```

---

## 5.3 `features/`

Organização por domínio. Cada feature é autônoma.

```text
features/
├── auth/
├── wallets/
├── websites/
├── transactions/
├── goals/
├── portfolio/
└── market/
```

Cada feature pode conter internamente:

```text
features/
└── wallets/
    ├── components/
    ├── hooks/
    ├── queries/
    ├── mutations/
    ├── schemas/
    ├── types/
    └── utils/
```

---

## 5.4 `services/api/`

Cliente HTTP centralizado.

```text
services/
└── api/
    ├── client.ts
    ├── users.ts
    ├── wallets.ts
    ├── websites.ts
    ├── transactions.ts
    ├── goals.ts
    ├── portfolio.ts
    └── market.ts
```

Fluxo:

```text
Component
    ↓
Hook
    ↓
TanStack Query
    ↓
API Service
    ↓
HTTP
    ↓
Backend
```

Evitar:

```text
Component → fetch()
```

---

## 5.5 `stores/`

Estado global de interface via Zustand.

```text
stores/
├── ui.store.ts
└── app.store.ts
```

Uso:

```text
Sidebar expandida/recolhida
Modal aberto/fechado
Tema
Preferências de UI
```

---

## 5.6 `schemas/`

Schemas Zod para validação de formulários.

```text
schemas/
├── wallet.schema.ts
├── website.schema.ts
├── transaction.schema.ts
├── goal.schema.ts
└── withdrawal.schema.ts
```

Fluxo:

```text
Form
  ↓
Zod
  ↓
API
```

---

## 5.7 `types/`

Tipos TypeScript compartilhados.

```text
types/
├── api.ts
├── wallet.ts
├── website.ts
├── transaction.ts
├── goal.ts
├── portfolio.ts
└── market.ts
```

---

# 6. TanStack Query

TanStack Query gerencia todo o **server state**.

### 6.1 Queries

```text
useWalletsQuery()
useWalletQuery(id)
useWebsitesQuery()
useWebsiteQuery(id)
useTransactionsQuery()
useTransactionsFiltersQuery()
useGoalsQuery()
useGoalQuery(id)
useGoalProgressQuery(id)
usePortfolioQuery()
usePortfolioPositionsQuery()
usePortfolioByWalletQuery()
usePortfolioByAssetQuery()
```

### 6.2 Mutations

```text
useCreateWalletMutation()
useUpdateWalletMutation()
useArchiveWalletMutation()
useActivateWalletMutation()
useDeactivateWalletMutation()
useDeleteWalletMutation()

useDepositToWalletMutation()
useWithdrawFromWalletMutation()
useTransferBetweenWalletsMutation()
useAdjustWalletMutation()

useCreateWebsiteMutation()
useUpdateWebsiteMutation()
useArchiveWebsiteMutation()
useDeleteWebsiteMutation()

useRecordEarningMutation()
useWithdrawFromWebsiteMutation()

useCreateGoalMutation()
useUpdateGoalMutation()
useArchiveGoalMutation()
useRecalculateGoalProgressMutation()

useUpdateTransactionMutation()
useDeleteTransactionMutation()
```

### 6.3 Invalidação

Após uma mutation, as queries afetadas devem ser invalidadas.

Exemplo:

```text
withdrawFromWebsite()
    ↓
invalidate:
    website
    wallet
    transactions
    portfolio
    goals
```

O frontend não deve tentar atualizar manualmente essas entidades.

A API é a fonte dos dados atualizados.

---

# 7. Regra TanStack Query x Zustand

```text
Dados vindos da API
    ↓
TanStack Query

Estado da interface
    ↓
Zustand
```

Exemplo:

```text
Wallets vindas da API     → TanStack Query
Modal aberto/fechado      → Zustand
Sidebar expandida          → Zustand
Filtros de UI persistentes → Zustand
```

Zustand não deve armazenar como fonte principal:

```text
Wallets
Websites
Transactions
Goals
Portfolio
```

Esses dados pertencem ao server state.

---

# 8. Autenticação

Clerk é responsável por:

```text
Login
Logout
Session
Protected routes
User information
Password reset
```

### 8.1 Fluxo de autenticação

```text
Usuário
    ↓
Clerk (login)
    ↓
Session token
    ↓
Frontend
    ↓
POST /users/sync
    ↓
User APM SYN
    ↓
API com Authorization header
```

### 8.2 Rotas protegidas

Todas as rotas exceto login/register exigem sessão válida.

```text
/login          → pública
/register       → pública
/dashboard      → protegida
/wallets        → protegida
/websites       → protegida
/transactions   → protegida
/goals          → protegida
/portfolio      → protegida
```

---

# 9. Roadmap de desenvolvimento

## Fase 0 — Arquitetura e Setup

**Objetivo:** preparar a base técnica do frontend.

Atividades:

```text
Inicializar projeto com Vite + React + TypeScript
Configurar Tailwind CSS 4
Configurar ESLint e Prettier
Configurar aliases de import
Configurar variáveis de ambiente
Definir estrutura de diretórios
Configurar Clerk
Configurar React Router
Configurar TanStack Query
Configurar Zustand
Configurar Zod
Configurar build e scripts
```

**Critério:** frontend inicia, compila e está preparado para receber funcionalidades.

---

## Fase 1 — Design System e Layout Base

**Objetivo:** criar a identidade visual consistente do APM SYN.

Atividades:

```text
Definir cores (light/dark)
Definir tipografia
Definir spacing
Definir border radius
Definir shadows
Criar Button
Criar Input
Criar Select
Criar Badge
Criar Card
Criar Table
Criar Modal
Criar Dialog
Criar Alert
Criar Skeleton
Criar Loading indicators
Definir responsividade (Desktop, Tablet, Mobile)
```

**Critério:** existe uma linguagem visual consistente reutilizável em todas as telas.

---

## Fase 2 — Autenticação e Sessão

**Objetivo:** integrar Clerk e proteger a aplicação.

Atividades:

```text
Integrar ClerkProvider
Implementar Login page
Implementar Register page
Implementar Protected route layout
Implementar User menu no header
Integrar POST /users/sync no login
Implementar Logout
Tratar sessão expirada
```

Fluxo:

```text
Usuário
    ↓
Clerk
    ↓
Sessão
    ↓
Frontend
    ↓
POST /users/sync
    ↓
User APM SYN
```

**Critério:** usuário consegue autenticar e acessar apenas rotas protegidas.

---

## Fase 3 — API Client e Data Layer

**Objetivo:** criar a camada de comunicação com a API.

Atividades:

```text
Criar client HTTP centralizado (axios/fetch)
Configurar base URL
Configurar Authorization header
Configurar interceptors de erro
Configurar request ID
Definir tipos das respostas
Criar services por domínio
Integrar com TanStack Query
Configurar cache e invalidação
```

Estrutura:

```text
services/
└── api/
    ├── client.ts
    ├── users.ts
    ├── wallets.ts
    ├── websites.ts
    ├── transactions.ts
    ├── goals.ts
    ├── portfolio.ts
    └── market.ts
```

Fluxo:

```text
Component
    ↓
Hook
    ↓
TanStack Query
    ↓
API Client
    ↓
APM SYN API
```

**Critério:** frontend consegue comunicar com a API de maneira centralizada e previsível.

---

## Fase 4 — App Shell e Navegação

**Objetivo:** construir a estrutura principal de navegação.

Atividades:

```text
Criar AppLayout
Criar Sidebar
Criar Header
Criar User Menu
Criar Breadcrumbs
Criar PageContainer
Implementar routing completo
Implementar mobile navigation
Implementar protected layout
```

Estrutura visual:

```text
┌─────────────────────────────────────┐
│ Header                              │
├────────────┬────────────────────────┤
│ Sidebar    │                        │
│            │     Main Content       │
│ Dashboard  │                        │
│ Wallets    │                        │
│ Websites   │                        │
│ Transactions                        │
│ Portfolio  │                        │
│ Goals      │                        │
└────────────┴────────────────────────┘
```

**Critério:** toda a aplicação possui uma estrutura navegável com sidebar, header e conteúdo principal.

---

## Fase 5 — Wallets

**Objetivo:** implementar o módulo completo de gestão de Wallets.

Atividades:

```text
Wallet List (tabela com filtros, sorting, paginação)
Wallet Details (visualização com balances)
Create Wallet (formulário)
Edit Wallet (formulário)
Archive Wallet (confirmação)
Activate Wallet
Deactivate Wallet
Delete Wallet (confirmação)
Empty states
Loading states
Error states
```

Operações:

```text
Create     → POST   /wallets
Read       → GET    /wallets/:id
List       → GET    /wallets
Update     → PATCH  /wallets/:id
Archive    → POST   /wallets/:id/archive
Activate   → POST   /wallets/:id/activate
Deactivate → POST   /wallets/:id/deactivate
Delete     → DELETE /wallets/:id
```

**Critério:** Wallet pode ser completamente administrada pelo frontend através da API.

---

## Fase 6 — Operações Financeiras da Wallet

**Objetivo:** implementar operações financeiras que afetam a Wallet.

Atividades:

```text
Deposit (formulário com asset, quantidade, usdValue, date)
Withdraw (formulário com validação de saldo)
Transfer (formulário com wallet origem/destino)
Adjust (formulário com direction increase/decrease)
```

Fluxo:

```text
Wallet
    ↓
Operação (Deposit/Withdraw/Transfer/Adjust)
    ↓
API
    ↓
Transaction criada
    ↓
Dados derivados atualizados
```

O frontend **não calcula nem altera saldo diretamente**.

```text
Frontend → Solicita operação → API → Regra de negócio → Transaction
```

Operações:

```text
Deposit    → POST /wallets/:id/deposits
Withdraw   → POST /wallets/:id/withdrawals
Transfer   → POST /wallet-transfers
Adjust     → POST /wallets/:id/adjustments
```

**Critério:** todas as operações financeiras da Wallet funcionam pela interface.

---

## Fase 7 — Websites

**Objetivo:** implementar o módulo completo de gestão de Websites.

Atividades:

```text
Website List (tabela com filtros, paginação)
Website Details (visualização com balances e status)
Create Website (formulário)
Edit Website (formulário)
Archive Website (confirmação)
Delete Website (confirmação)
Empty states
Loading states
Error states
```

Operações:

```text
Create   → POST   /websites
Read     → GET    /websites/:id
List     → GET    /websites
Update   → PATCH  /websites/:id
Archive  → POST   /websites/:id/archive
Delete   → DELETE /websites/:id
```

**Critério:** Websites podem ser administrados completamente pelo frontend.

---

## Fase 8 — Operações Financeiras do Website

**Objetivo:** implementar operações financeiras que envolvem o Website.

Atividades:

```text
Record Earning (formulário com asset, quantidade, usdValue, date)
Withdraw from Website (formulário com wallet destino)
```

Fluxo Earning:

```text
Website
    ↓
Record Earning
    ↓
Asset + Quantidade
    ↓
API
    ↓
Transaction: EXTERNAL → WEBSITE
```

Fluxo Withdraw:

```text
Website
    ↓
Withdraw
    ↓
Selecionar Wallet destino
    ↓
Asset + Quantidade
    ↓
API
    ↓
Transaction: WEBSITE → WALLET
```

Operações:

```text
Earning  → POST /websites/:id/earnings
Withdraw → POST /websites/:id/withdrawals
```

**Critério:** usuário consegue registrar ganhos e retirar valores do Website pela interface.

---

## Fase 9 — Transactions

**Objetivo:** implementar o módulo de histórico financeiro.

Atividades:

```text
Transaction List (tabela com filtros avançados)
Transaction Details (visualização completa)
Edit Transaction (campos permitidos)
Delete Transaction (confirmação)
```

Filtros:

```text
Wallet
Website
Asset
Type
Date range (from/to)
Counts toward goal
Sort
Pagination
```

Tipos de Transaction:

```text
WALLET_DEPOSIT
WALLET_WITHDRAWAL
WALLET_TRANSFER
WALLET_ADJUSTMENT
WEBSITE_EARNING
WEBSITE_WITHDRAWAL
```

A UI deve deixar claro:

```text
Source → Transaction → Destination
```

Operações:

```text
List   → GET    /transactions
Read   → GET    /transactions/:id
Update → PATCH  /transactions/:id
Delete → DELETE /transactions/:id
```

**Critério:** histórico financeiro completo e consultável com filtros.

---

## Fase 10 — SYN Core / Website → Wallet

**Objetivo:** implementar visualmente o fluxo principal do APM SYN.

Atividades:

```text
Interface dedicada para Website → Wallet
Seleção de Website origem
Seleção de Asset
Seleção de Wallet destino
Confirmação visual da operação
Feedback pós-operação
```

Fluxo visual:

```text
From:   [ Binance ]
Asset:  [ USDT ]
Amount: [ 250 ]
To:     [ Trust Wallet ]

        [ Withdraw ]

        ✓ Withdrawal completed

        Binance:   -250 USDT
        Trust Wallet: +250 USDT
```

Esta é a operação que define o APM SYN.

**Critério:** o usuário consegue executar e compreender visualmente a sincronização Website → Wallet.

---

## Fase 11 — Market Data / CoinGecko

**Objetivo:** integrar dados de mercado reais na interface.

Atividades:

```text
Integrar search de assets
Integrar seleção de asset com preço
Integrar conversão USD
Exibir preço atual
Tratar loading e erro
Cache via TanStack Query
```

Fluxo:

```text
Frontend
    ↓
APM SYN API
    ↓
CoinGecko
```

Nunca:

```text
Frontend → CoinGecko ❌
```

Endpoints:

```text
GET /market/assets
GET /market/assets/search?q=...
GET /market/assets/:id
GET /market/assets/:id/price
GET /market/assets/:id/convert
```

**Critério:** assets e preços reais aparecem na interface.

---

## Fase 12 — Portfolio

**Objetivo:** consolidar e visualizar o patrimônio total.

Atividades:

```text
Portfolio summary (total USD, wallets, assets)
Portfolio positions (lista de ativos)
Distribuição por Wallet
Distribuição por Asset
Evolução patrimonial (histórico)
```

Fluxo:

```text
Transactions
    ↓
Wallet Holdings
    ↓
Assets
    ↓
Prices (CoinGecko)
    ↓
USD
    ↓
Portfolio
```

Regra:

> Frontend não é a fonte do cálculo financeiro.

O backend fornece os dados derivados.

Endpoints:

```text
GET /portfolio
GET /portfolio/positions
GET /portfolio/by-wallet
GET /portfolio/by-asset
GET /portfolio/history
```

**Critério:** usuário consegue visualizar seu patrimônio de forma clara e confiável.

---

## Fase 13 — Goals

**Objetivo:** implementar o módulo de metas financeiras.

Atividades:

```text
Create Goal (formulário com wallets, distribuição, valores)
List Goals (cards ou tabela)
Goal Details (progresso visual)
Archive Goal (confirmação)
Progress visualization
Snapshot visualization
```

Visualização de progresso:

```text
Goal: Emergency Fund

████████████░░░░░░ 65%

$6,500 / $10,000
```

O frontend consulta o progresso calculado pelo backend.

Goal não cria Transactions.

Endpoints:

```text
POST   /goals
GET    /goals
GET    /goals/:id
PATCH  /goals/:id
POST   /goals/:id/archive
GET    /goals/:id/progress
POST   /goals/:id/progress/recalculate
GET    /goals/:id/deposits
GET    /goals/:id/snapshot
```

**Critério:** Goals mostram progresso corretamente sem interferir nos dados financeiros.

---

## Fase 14 — Dashboard

**Objetivo:** criar a visão resumida consolidada do sistema.

O Dashboard é implementado depois dos módulos principais para garantir que os dados existem de verdade.

Atividades:

```text
Total Portfolio Value
Wallets count e resumo
Websites count e resumo
Recent Transactions
Goals progress
Asset Distribution
Market information
```

Layout:

```text
┌─────────────────────────────────────┐
│ Portfolio Value                     │
│ $24,830                             │
├───────────────┬─────────────────────┤
│ Wallets       │ Websites            │
│ 5             │ 8                   │
├───────────────┴─────────────────────┤
│ Portfolio Distribution              │
│                                     │
├─────────────────────────────────────┤
│ Recent Transactions                 │
├─────────────────────────────────────┤
│ Goals Progress                      │
└─────────────────────────────────────┘
```

**Critério:** Dashboard funciona como uma visão resumida e confiável do sistema.

---

## Fase 15 — Estados, UX e Responsividade

**Objetivo:** revisar todas as telas para consistência e qualidade.

Atividades:

```text
Revisar todos os estados de UI:
    Loading → Skeleton
    Empty → Empty state com ação
    Error → Mensagem amigável com retry
    Success → Feedback visual
    Disabled → Elementos desabilitados
    Pending → Indicador de carregamento
    Archived → Estado visual diferenciado

Responsividade:
    Mobile
    Tablet
    Desktop

UX:
    Keyboard navigation
    Acessibilidade
    Feedback visual
    Confirmação de operações destrutivas
    Transições e animações
```

**Critério:** aplicação consistente e agradável em diferentes tamanhos de tela e estados.

---

## Fase 16 — Testes

**Objetivo:** testar os fluxos críticos do frontend.

Tipos:

```text
Unit         → funções utilitários, schemas, hooks
Component    → componentes isolados
Integration  → fluxos com API
E2E          → fluxos completos do usuário
```

Principalmente:

```text
Autenticação
Operações de Wallet
Operações de Website
Transactions
Website → Wallet
Goals
Portfolio
Tratamento de erros e ownership
```

Ferramentas:

```text
Vitest       → Unit e Component
Playwright   → E2E
```

**Critério:** fluxos críticos do frontend são testados automaticamente.

---

## Fase 17 — Hardening e Produção

**Objetivo:** preparar o frontend para produção.

Atividades:

```text
Revisar environment variables
Configurar production API URL
Verificar CORS
Otimizar build
Otimizar assets
Revisar error handling
Revisar security
Revisar authentication
Proteger secrets
Otimizar performance
Code splitting
Lazy loading
Caching
```

Comandos:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

**Critério:** frontend funciona em produção com a API, sem erros e com performance adequada.

---

# 10. Mapa completo de fases

```text
FASE 0  → Arquitetura e Setup
FASE 1  → Design System e Layout Base
FASE 2  → Autenticação e Sessão
FASE 3  → API Client e Data Layer
FASE 4  → App Shell e Navegação
FASE 5  → Wallets
FASE 6  → Operações Financeiras da Wallet
FASE 7  → Websites
FASE 8  → Operações Financeiras do Website
FASE 9  → Transactions
FASE 10 → SYN Core / Website → Wallet
FASE 11 → Market Data / CoinGecko
FASE 12 → Portfolio
FASE 13 → Goals
FASE 14 → Dashboard
FASE 15 → Estados, UX e Responsividade
FASE 16 → Testes
FASE 17 → Hardening e Produção
```

---

# 11. Fluxo de dados completo

```text
User
  ↓
React
  ↓
Feature
  ↓
Hook
  ↓
TanStack Query
  ↓
API Client
  ↓
HTTP
  ↓
Express
  ↓
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Mongoose
  ↓
MongoDB
```

Resposta:

```text
MongoDB
  ↓
Repository
  ↓
Service
  ↓
Controller
  ↓
HTTP Response
  ↓
TanStack Query
  ↓
React
```

---

# 12. Ordem de implementação

A ordem é proposital. Wallets vem antes de Websites porque Website → Wallet depende de Wallet existir.

```text
Wallets → Websites → Transactions → SYN Core → Market Data → Portfolio → Goals → Dashboard
```

Não começamos pelo Dashboard porque ele precisa de dados reais para ser útil.

---

# 13. O que não deve acontecer

## Frontend não deve:

```text
calcular saldo financeiro como fonte da verdade
criar Transactions diretamente
acessar MongoDB
acessar diretamente a API de Market Data
implementar regras financeiras do domínio
substituir TanStack Query com Zustand para dados da API
```

## Frontend deve:

```text
enviar operações para a API
apresentar dados retornados pela API
invalidar queries após mutations
tratar estados de loading, erro e vazio
validar entrada do usuário com Zod
```

---

# 14. Convenções

### 14.1 Nomenclatura

```text
Components      → PascalCase (WalletCard, TransactionTable)
Hooks           → camelCase com prefixo use (useWalletsQuery)
Services        → camelCase (fetchWallets, createWallet)
Schemas         → PascalCase com sufixo Schema (WalletFormSchema)
Types           → PascalCase (Wallet, Transaction)
Stores          → camelCase com sufixo Store (useUIStore)
```

### 14.2 Arquivos

```text
Component       → WalletCard.tsx
Hook            → useWalletsQuery.ts
Service         → wallets.ts
Schema          → wallet.schema.ts
Type            → wallet.ts
Store           → ui.store.ts
```

### 14.3 Importações

```text
aliases configurados no tsconfig e vite.config

@/components/...
@/features/...
@/services/...
@/hooks/...
@/stores/...
@/schemas/...
@/types/...
```

---

# 15. Referências

- `docs/architecture.md` — Arquitetura geral do APM SYN
- `docs/api.md` — Especificação completa da API
- `docs/project-overview.md` — Visão geral do projeto
- `docs/business-rules.md` — Regras de negócio
- `docs/entity-relationships.md` — Relacionamentos entre entidades
- `docs/mongodb-model.md` — Modelo de dados MongoDB
