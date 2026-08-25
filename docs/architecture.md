# APM SYN — Estrutura do Frontend / Backend

## 1. Objetivo

Esta documentação define a arquitetura e a organização do código do APM SYN.

O objetivo é estabelecer:

- separação entre frontend e backend;
- responsabilidades de cada camada;
- estrutura de diretórios;
- fluxo de dados;
- responsabilidades das principais tecnologias;
- organização por domínio;
- comunicação entre frontend e backend;
- localização das regras de negócio;
- tratamento das operações financeiras;
- integração com serviços externos.

A estrutura deve favorecer:

- manutenção;
- escalabilidade;
- testabilidade;
- baixo acoplamento;
- separação de responsabilidades;
- evolução independente do frontend e backend.

---

# 2. Stack

## 2.1 Frontend

```text
React
TypeScript
Vite
Tailwind CSS 4
TanStack Query
Zustand
Zod
Clerk
```

## 2.2 Backend

```text
Node.js
Express
TypeScript
MongoDB
Mongoose
Zod
Clerk
```

## 2.3 Integrações externas

```text
Clerk
Crypto Market Data API
```

---

# 3. Arquitetura geral

O APM SYN será dividido em duas aplicações:

```text
APM SYN
│
├── frontend
│
└── backend
```

A comunicação ocorre através de uma API REST.

```text
┌──────────────────────────┐
│         FRONTEND         │
│                          │
│ React                    │
│ TypeScript               │
│ Tailwind CSS             │
│ TanStack Query           │
│ Zustand                  │
│ Zod                      │
│ Clerk                    │
└────────────┬─────────────┘
             │
             │ HTTP / JSON
             ▼
┌──────────────────────────┐
│          BACKEND         │
│                          │
│ Node.js                  │
│ Express                  │
│ TypeScript               │
│ Zod                      │
│ Clerk                    │
│                          │
│ Routes                   │
│ Controllers              │
│ Services                 │
│ Repositories             │
│ Models                   │
└────────────┬─────────────┘
             │
             ▼
       ┌───────────┐
       │  MongoDB  │
       └───────────┘
```

Integrações externas:

```text
                    ┌───────────┐
                    │   Clerk   │
                    └─────┬─────┘
                          │
                          ▼
Frontend ────────► Backend
                          │
                          ▼
                ┌─────────────────┐
                │ Crypto Market   │
                │ Data Provider   │
                └─────────────────┘
```

---

# 4. Princípio fundamental da arquitetura

O frontend é responsável pela **interface**.

O backend é responsável pelo **domínio**.

Em particular, as regras financeiras pertencem ao backend.

O frontend não deve decidir como uma operação financeira afeta Wallet, Website, Transaction, Portfolio ou Goal.

Exemplo:

```text
Usuário
   │
   │ informa:
   │ Website
   │ Wallet
   │ Asset
   │ Quantidade
   ▼
Frontend
   │
   │ POST /websites/:id/withdrawals
   ▼
Backend
   │
   ▼
Regra de negócio
   │
   ▼
Transaction
   │
   ├── Wallet
   ├── Website
   ├── Portfolio
   └── Goal
```

O frontend apenas solicita a operação.

O backend determina o resultado.

---

# 5. Frontend

## 5.1 Responsabilidades

O frontend é responsável por:

- interface gráfica;
- navegação;
- layouts;
- componentes;
- formulários;
- validação de entrada para UX;
- estado local;
- estado global de interface;
- estado remoto;
- comunicação com a API;
- apresentação dos dados;
- autenticação através do Clerk.

O frontend **não é responsável pelas regras financeiras do sistema**.

---

# 6. Estrutura do Frontend

Estrutura proposta:

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
├── package.json
├── vite.config.ts
├── tsconfig.json
└── ...
```

---

# 7. Frontend — `app`

Responsável pela configuração estrutural da aplicação.

```text
app/
├── router/
├── providers/
└── layouts/
```

### `router/`

Responsável pelas rotas da aplicação.

Exemplo:

```text
/dashboard
/wallets
/websites
/transactions
/goals
/portfolio
```

### `providers/`

Configuração de providers globais.

Exemplos:

- Clerk;
- TanStack Query;
- outros providers globais futuros.

### `layouts/`

Layouts gerais da aplicação.

Exemplo:

```text
AppLayout
├── Sidebar
├── Header
└── Main Content
```

---

# 8. Frontend — `components`

Componentes reutilizáveis.

```text
components/
├── ui/
├── layout/
└── shared/
```

## `ui/`

Componentes visuais genéricos.

Exemplos:

```text
Button
Input
Select
Modal
Table
Badge
Card
Dropdown
```

Não devem possuir regras específicas de Wallet, Website etc.

## `layout/`

Componentes estruturais.

Exemplos:

```text
Sidebar
Header
Navigation
PageContainer
```

## `shared/`

Componentes reutilizáveis entre diferentes features, mas que possuem algum contexto da aplicação.

---

# 9. Frontend — `features`

A aplicação será organizada principalmente por domínio.

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

Cada feature pode possuir sua própria estrutura interna.

Exemplo:

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

Essa abordagem evita concentrar toda a lógica em pastas globais gigantes.

---

# 10. Feature `wallets`

Responsável pela interface relacionada às Wallets.

Pode conter:

```text
wallets/
├── components/
├── hooks/
├── queries/
├── mutations/
├── schemas/
└── types/
```

Exemplos de operações:

```text
createWallet
updateWallet
archiveWallet
depositToWallet
withdrawFromWallet
adjustWallet
transferBetweenWallets
```

As funções do frontend apenas chamam a API.

A regra financeira fica no backend.

---

# 11. Feature `websites`

Responsável pela interface dos Websites.

Exemplos:

```text
createWebsite
updateWebsite
archiveWebsite
recordEarning
withdrawFromWebsite
```

O fluxo mais importante do APM SYN ocorre aqui:

```text
Website Withdrawal
        │
        ├── Website
        ├── Wallet
        ├── Asset
        ├── Quantity
        └── USD Value
```

O frontend envia esses dados para a API.

Não executa a sincronização.

---

# 12. Feature `transactions`

Responsável por apresentar o histórico financeiro.

Pode conter:

- tabela de transactions;
- filtros;
- ordenação;
- paginação;
- detalhes;
- edição;
- exclusão;
- histórico por Wallet;
- histórico por Website.

Transactions são consultadas através da API.

---

# 13. Feature `goals`

Responsável pela interface das metas.

Pode conter:

- criação;
- configuração;
- associação com Wallets;
- progresso;
- progresso diário;
- progresso por Wallet;
- deposits elegíveis;
- snapshot;
- arquivamento.

Goal não cria Transactions.

O frontend apenas consulta o progresso calculado pelo backend.

---

# 14. Feature `portfolio`

Responsável pela visualização consolidada do patrimônio.

Exemplos:

```text
Total USD
Assets
Wallet distribution
Asset distribution
History
```

Portfolio é uma visão derivada.

Não deve existir uma lógica independente de Portfolio no frontend que tente recalcular o patrimônio de forma diferente da API.

---

# 15. Feature `market`

Responsável pela interação com os dados de mercado.

Exemplos:

```text
Asset search
Asset selection
Current price
USD conversion
```

Principalmente utilizada durante operações como:

```text
Website → Wallet
```

O usuário seleciona um Asset fornecido pelo serviço de Market Data.

---

# 16. TanStack Query

TanStack Query será responsável pelo **server state**.

Utilizar para:

- queries;
- mutations;
- cache;
- loading;
- errors;
- refetch;
- invalidação;
- sincronização com a API.

Exemplos:

```text
useWalletsQuery()
useWalletQuery(id)

useWebsitesQuery()
useWebsiteQuery(id)

useTransactionsQuery()

useGoalsQuery()
useGoalProgressQuery(id)

usePortfolioQuery()
```

Mutations:

```text
useCreateWalletMutation()
useDepositToWalletMutation()
useWithdrawFromWebsiteMutation()
useTransferBetweenWalletsMutation()
useCreateGoalMutation()
```

---

# 17. Regra TanStack Query × Zustand

A separação será:

```text
Dados vindos da API
        ↓
TanStack Query
```

```text
Estado da interface
        ↓
Zustand
```

Não utilizar Zustand como substituto do TanStack Query.

Exemplo:

```text
Wallets vindas da API
→ TanStack Query

Modal aberto/fechado
→ Zustand

Sidebar expandida/recolhida
→ Zustand
```

---

# 18. Zustand

Zustand será utilizado para estado local/global de interface.

Exemplos:

- sidebar;
- tema;
- filtros persistentes de UI;
- modal;
- preferências;
- estado de componentes;
- fluxos de interface.

Zustand não deve armazenar como fonte principal:

- Wallets;
- Websites;
- Transactions;
- Goals;
- Portfolio.

Esses dados pertencem ao server state.

---

# 19. Zod no Frontend

Zod será utilizado para validar dados de entrada.

Exemplos:

```text
WalletFormSchema
WebsiteFormSchema
WithdrawalFormSchema
DepositFormSchema
GoalFormSchema
```

Fluxo:

```text
Form
 ↓
Zod
 ↓
API
```

A validação do frontend existe principalmente para melhorar a experiência do usuário.

Ela não substitui a validação do backend.

---

# 20. API Client

As chamadas HTTP devem ser centralizadas.

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

Evitar:

```text
React Component
      ↓
fetch()
```

Preferir:

```text
React Component
      ↓
Hook
      ↓
API Service
      ↓
HTTP
      ↓
Backend
```

---

# 21. Autenticação no Frontend

Clerk será responsável por:

- login;
- signup;
- logout;
- sessão;
- alteração de senha;
- reset de senha;
- proteção de rotas.

O frontend não implementará autenticação manual.

---

# 22. Backend

## 22.1 Responsabilidades

O backend será responsável por:

- API REST;
- autenticação/autorização;
- validação;
- regras de negócio;
- operações financeiras;
- persistência;
- consultas;
- dados derivados;
- integração com Market Data;
- tratamento de erros.

O backend é a autoridade sobre o domínio.

---

# 23. Estrutura do Backend

```text
backend/
│
├── src/
│   │
│   ├── config/
│   │
│   ├── routes/
│   │
│   ├── controllers/
│   │
│   ├── services/
│   │
│   ├── repositories/
│   │
│   ├── models/
│   │
│   ├── schemas/
│   │
│   ├── middlewares/
│   │
│   ├── integrations/
│   │   ├── clerk/
│   │   └── market-data/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   ├── app.ts
│   └── server.ts
│
├── package.json
├── tsconfig.json
└── ...
```

---

# 24. Backend — `config`

Configurações da aplicação.

Exemplos:

```text
database
environment
Clerk
Market Data
CORS
```

Variáveis sensíveis devem vir de variáveis de ambiente.

---

# 25. Backend — `routes`

Define os endpoints HTTP.

Exemplo:

```text
routes/
├── user.routes.ts
├── wallet.routes.ts
├── website.routes.ts
├── transaction.routes.ts
├── goal.routes.ts
├── portfolio.routes.ts
└── market.routes.ts
```

Routes não devem conter regras de negócio complexas.

Fluxo:

```text
Request
 ↓
Route
 ↓
Controller
```

---

# 26. Backend — `controllers`

Controllers fazem a ponte entre HTTP e domínio.

Responsabilidades:

- receber request;
- obter parâmetros;
- chamar o Service;
- retornar response;
- encaminhar erros.

Exemplo:

```text
POST /websites/:id/withdrawals
             ↓
WebsiteController
             ↓
WebsiteWithdrawalService
```

Controllers não devem implementar a lógica financeira.

---

# 27. Backend — `services`

Services contêm as regras de negócio.

Esta é a principal camada de domínio.

Estrutura possível:

```text
services/
├── users/
├── wallets/
├── websites/
├── transactions/
├── goals/
├── portfolio/
└── market/
```

Operações financeiras:

```text
depositToWallet()
withdrawFromWallet()
transferBetweenWallets()
adjustWallet()

recordEarning()
withdrawFromWebsite()
```

---

# 28. Backend — Repositories

Repositories são responsáveis pelo acesso aos dados.

```text
repositories/
├── user.repository.ts
├── wallet.repository.ts
├── website.repository.ts
├── transaction.repository.ts
└── goal.repository.ts
```

Fluxo:

```text
Service
   ↓
Repository
   ↓
Mongoose
   ↓
MongoDB
```

O Service não deve espalhar queries MongoDB diretamente pelo código.

---

# 29. Backend — Models

Mongoose representa os documentos MongoDB.

```text
models/
├── user.model.ts
├── wallet.model.ts
├── website.model.ts
├── transaction.model.ts
└── goal.model.ts
```

Collections:

```text
users
wallets
websites
transactions
goals
```

Não existe uma entidade `Asset` persistida pelo APM SYN.

Assets são identificados através do catálogo externo.

Também não existe uma collection `portfolio`.

---

# 30. Backend — Schemas

Zod valida requests recebidos pela API.

Exemplo:

```text
schemas/
├── user/
├── wallet/
├── website/
├── transaction/
├── goal/
└── market/
```

Fluxo:

```text
HTTP Request
     ↓
Zod
     ↓
Controller
     ↓
Service
```

Mesmo que o frontend valide os dados, o backend sempre deve validar novamente.

---

# 31. Backend — Middlewares

Estrutura:

```text
middlewares/
├── auth.middleware.ts
├── validation.middleware.ts
├── error.middleware.ts
├── not-found.middleware.ts
└── rate-limit.middleware.ts
```

### `auth.middleware`

Valida a autenticação através do Clerk.

### `validation.middleware`

Executa schemas Zod.

### `error.middleware`

Centraliza erros da aplicação.

### `not-found.middleware`

Trata rotas inexistentes.

### `rate-limit.middleware`

Protege endpoints contra excesso de requisições.

---

# 32. Clerk no Backend

O backend valida a identidade fornecida pelo Clerk.

Fluxo:

```text
Frontend
   ↓
Clerk
   ↓
Authentication Token
   ↓
Backend
   ↓
Auth Middleware
   ↓
clerkId
   ↓
User interno
```

O usuário interno será associado ao `clerkId`.

Toda operação de domínio deve ser executada dentro do contexto do usuário autenticado.

---

# 33. Integrações externas

Integrações externas ficam isoladas em:

```text
integrations/
├── clerk/
└── market-data/
```

O restante da aplicação não deve depender diretamente da implementação específica do fornecedor.

Exemplo:

```text
Service
   ↓
MarketDataProvider
   ↓
External API
```

Isso permite substituir o fornecedor no futuro sem reescrever o domínio.

---

# 34. Crypto Market Data

A integração de Market Data será responsável por:

- pesquisar assets;
- listar assets;
- consultar informações;
- obter preço;
- converter asset para USD.

O backend atua como intermediário.

O frontend não deve depender diretamente da API externa.

```text
React
 ↓
APM SYN API
 ↓
Market Data Service
 ↓
External Provider
```

---

# 35. Operações financeiras

As operações financeiras são executadas exclusivamente pelo backend.

Principais operações:

```text
depositToWallet()
withdrawFromWallet()
transferBetweenWallets()
adjustWallet()

recordEarning()
withdrawFromWebsite()
```

---

# 36. Website → Wallet

Fluxo principal do APM SYN:

```text
Frontend
   ↓
POST /websites/:id/withdrawals
   ↓
Controller
   ↓
WebsiteWithdrawalService
   ↓
Validar Website
   ↓
Validar Wallet
   ↓
Validar Asset
   ↓
Validar quantidade
   ↓
Validar regras de negócio
   ↓
Criar Transaction
   ↓
MongoDB
   ↓
Response
```

A operação representa:

```text
WEBSITE → WALLET
```

O usuário não precisa inserir novamente a mesma operação na Wallet.

---

# 37. Wallet → Wallet

Fluxo:

```text
Frontend
   ↓
POST /wallet-transfers
   ↓
TransferService
   ↓
Validar Wallet origem
   ↓
Validar Wallet destino
   ↓
Validar Asset
   ↓
Validar quantidade
   ↓
Criar Transaction
```

Representação:

```text
WALLET → WALLET
```

---

# 38. External → Wallet

Fluxo:

```text
POST /wallets/:id/deposits
             ↓
DepositService
             ↓
Transaction
```

Representação:

```text
EXTERNAL → WALLET
```

---

# 39. Wallet → External

Fluxo:

```text
POST /wallets/:id/withdrawals
             ↓
WithdrawalService
             ↓
Transaction
```

Representação:

```text
WALLET → EXTERNAL
```

---

# 40. Website Earnings

Fluxo:

```text
POST /websites/:id/earnings
             ↓
EarningService
             ↓
Transaction
```

Representação:

```text
EXTERNAL → WEBSITE
```

---

# 41. Transaction como fonte da verdade

A arquitetura financeira será baseada em Transactions.

```text
                    TRANSACTIONS
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       Wallet         Website        Portfolio
          │
          ↓
        Goals
```

Wallet, Portfolio e Goal não devem possuir uma fonte financeira independente que possa divergir do histórico.

---

# 42. Wallet

A Wallet possui dados administrativos próprios.

Exemplos:

```text
name
type
status
description
color
```

Seu estado financeiro é derivado das Transactions.

A aplicação não deve depender de alterações manuais em:

```text
Wallet.balance
```

para manter a consistência financeira.

---

# 43. Website

O Website possui dados administrativos e financeiros derivados das Transactions.

Os ganhos e retiradas são registrados através de operações de domínio.

O saldo do Website não deve ser atualizado manualmente pelo frontend.

---

# 44. Portfolio

Portfolio não é uma entidade persistida.

É uma visão derivada.

```text
Transactions
      ↓
Portfolio
```

O frontend apenas apresenta os dados retornados pela API.

---

# 45. Goals

Goal não cria depósitos.

Goal observa Transactions elegíveis.

```text
Transactions
      ↓
filtro de elegibilidade
      ↓
Goal
      ↓
progresso
```

O cálculo do progresso pertence ao backend.

O frontend apresenta o resultado.

---

# 46. Fluxo de dados

Fluxo padrão:

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

# 47. Fluxo completo de uma retirada

Exemplo:

```text
Usuário seleciona:

Website = Site X
Wallet = Binance
Asset = USDT
Quantidade = 100
```

Frontend:

```text
WithdrawalForm
      ↓
Zod
      ↓
withdrawFromWebsite()
      ↓
POST /websites/:id/withdrawals
```

Backend:

```text
Route
 ↓
Auth Middleware
 ↓
Validation
 ↓
Controller
 ↓
WebsiteWithdrawalService
```

Service:

```text
validar Website
       ↓
validar Wallet
       ↓
validar Asset
       ↓
validar quantidade
       ↓
criar Transaction
```

Resultado:

```text
WEBSITE → WALLET
```

Depois:

```text
Transaction
    │
    ├── Website
    ├── Wallet
    ├── Portfolio
    └── Goal
```

Frontend:

```text
TanStack Query
      ↓
invalidate queries
      ↓
Wallet atualizada
Website atualizado
Transactions atualizadas
Portfolio atualizado
Goal atualizado quando aplicável
```

---

# 48. Invalidação de cache

Após uma mutation, o frontend deve invalidar as queries afetadas.

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

O frontend não deve tentar atualizar manualmente todas essas entidades.

A API é a fonte dos dados atualizados.

---

# 49. Separação de responsabilidades

A arquitetura segue:

```text
React
→ Interface

TanStack Query
→ Server State

Zustand
→ Client/UI State

Zod
→ Validação

API Client
→ Comunicação HTTP

Routes
→ Endpoints

Controllers
→ HTTP → Domínio

Services
→ Regras de negócio

Repositories
→ Persistência

Mongoose
→ Modelos MongoDB

MongoDB
→ Banco de dados

Clerk
→ Autenticação/Identidade

Market Data Provider
→ Dados externos
```

---

# 50. O que não deve acontecer

## Frontend não deve:

```text
calcular saldo financeiro como fonte da verdade
criar Transactions diretamente
alterar múltiplas entidades para simular sincronização
acessar MongoDB
acessar diretamente a API de Market Data
implementar regras financeiras do domínio
```

## Controller não deve:

```text
conter lógica financeira complexa
executar queries MongoDB diretamente
```

## Service não deve:

```text
depender da camada HTTP
retornar respostas HTTP diretamente
```

## Repository não deve:

```text
conter regras de negócio
decidir se uma operação financeira é válida
```

## Model não deve:

```text
ser responsável por toda a lógica do domínio
```

---

# 51. Regra arquitetural central

O APM SYN deve seguir o princípio:

```text
Uma operação do usuário
        ↓
Uma operação de domínio
        ↓
Uma Transaction
        ↓
Dados derivados sincronizados
```

Exemplo:

```text
Retirada do Website
        ↓
WebsiteWithdrawalService
        ↓
Transaction
        ↓
Website
Wallet
Portfolio
Goal
```

O usuário informa os dados uma única vez.

A aplicação se encarrega de sincronizar o restante.

---

# 52. Estrutura resumida

```text
APM SYN
│
├── FRONTEND
│   │
│   ├── React
│   ├── TypeScript
│   ├── Vite
│   ├── Tailwind CSS 4
│   │
│   ├── TanStack Query
│   │   └── Server State
│   │
│   ├── Zustand
│   │   └── UI State
│   │
│   ├── Zod
│   │   └── Form Validation
│   │
│   └── Clerk
│       └── Authentication
│
└── BACKEND
    │
    ├── Node.js
    ├── Express
    ├── TypeScript
    │
    ├── Routes
    ├── Controllers
    ├── Services
    │   └── Business Rules
    ├── Repositories
    ├── Models
    ├── Schemas
    ├── Middlewares
    │
    ├── Clerk
    │   └── Authentication
    │
    ├── Market Data
    │   └── External API
    │
    └── MongoDB
```

---

# 53. Princípio final

O APM SYN existe justamente para eliminar a duplicação de operações existente no APM Lite.

Portanto, a arquitetura deve refletir esse objetivo.

No APM Lite:

```text
Retirada do Website
      ↓
usuário registra retirada

depois:

Wallet
      ↓
usuário registra depósito manualmente

depois:

Asset
      ↓
usuário registra alteração manualmente
```

No APM SYN:

```text
Retirada do Website
      ↓
WebsiteWithdrawalService
      ↓
Transaction
      ↓
Wallet
      ↓
Portfolio
      ↓
Goal
```

Uma única ação do usuário deve ser suficiente para produzir todos os efeitos correspondentes no sistema.

**Esse é o princípio central da arquitetura do APM SYN.**
