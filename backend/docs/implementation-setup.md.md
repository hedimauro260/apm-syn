# APM SYN — Implementation Setup

## 1. Objetivo

Este documento define a configuração inicial e as decisões técnicas necessárias para iniciar o desenvolvimento do APM SYN.

O objetivo é estabelecer:

- estrutura do repositório;
- estrutura do frontend e backend;
- ferramentas utilizadas;
- configuração dos ambientes;
- variáveis de ambiente;
- configuração inicial de autenticação;
- configuração do banco de dados;
- configuração da API;
- configuração das ferramentas de desenvolvimento;
- scripts;
- testes;
- qualidade de código;
- primeiro fluxo funcional;
- ordem inicial de implementação.

Este documento não define regras de negócio nem endpoints detalhados da API.

Esses assuntos são definidos em documentos próprios.

---

# 2. Stack definida

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

````

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

## 2.3 Serviços externos

```text
Clerk
CoinGecko API
```

---

# 3. Arquitetura do projeto

O projeto será dividido em duas aplicações independentes:

```text
APM SYN
│
├── frontend/
│
└── backend/
```

O frontend será responsável pela interface.

O backend será responsável pela API, regras de negócio, autenticação/autorização, persistência e integrações.

Comunicação:

```text
Frontend
   │
   │ HTTP / JSON
   ▼
Backend
   │
   ├── Clerk
   ├── MongoDB
   └── Market Data API
```

---

# 4. Estrutura inicial do repositório

Estrutura proposta:

```text
apm-syn/
│
├── frontend/
│
├── backend/
│
├── docs/
│
├── .gitignore
├── README.md
└── package.json
```

A pasta `docs/` conterá a documentação técnica e de arquitetura do projeto.

Exemplo:

```text
docs/
├── syn-rules.md
├── entities.md
├── relationships.md
├── business-rules.md
├── database.md
├── api.md
├── frontend-backend.md
└── implementation-setup.md
```

---

# 5. Monorepo

O APM SYN será mantido em um único repositório Git.

Frontend e backend serão aplicações separadas dentro do mesmo repositório.

```text
Repository
│
├── frontend
│
├── backend
│
└── docs
```

Isso permite versionar frontend, backend e documentação de forma coordenada.

Inicialmente não será necessário utilizar ferramentas complexas de monorepo.

A estrutura poderá ser evoluída futuramente caso o projeto necessite.

---

# 6. Frontend

O frontend será criado com Vite.

Stack:

```text
React
TypeScript
Vite
Tailwind CSS 4
```

Bibliotecas adicionais:

```text
TanStack Query
Zustand
Zod
Clerk
```

---

# 7. Backend

O backend será uma aplicação Node.js utilizando Express e TypeScript.

Stack:

```text
Node.js
Express
TypeScript
```

Persistência:

```text
MongoDB
Mongoose
```

Validação:

```text
Zod
```

Autenticação:

```text
Clerk
```

---

# 8. Estrutura inicial do frontend

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
│   ├── hooks/
│   ├── stores/
│   ├── services/
│   │   └── api/
│   ├── schemas/
│   ├── types/
│   ├── lib/
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

# 9. Estrutura inicial do backend

```text
backend/
│
├── src/
│   │
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── schemas/
│   ├── middlewares/
│   │
│   ├── integrations/
│   │   ├── clerk/
│   │   └── market-data/
│   │
│   ├── types/
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

# 10. Node.js

O backend será executado utilizando Node.js.

A versão utilizada deverá ser uma versão LTS suportada pelo projeto.

A versão do Node deverá ser registrada no projeto para evitar diferenças entre ambientes.

Quando apropriado, será utilizado:

```text
.nvmrc
```

ou o campo correspondente no `package.json`.

---

# 11. TypeScript

Frontend e backend utilizarão TypeScript.

Objetivos:

- tipagem estática;
- redução de erros;
- melhor autocomplete;
- contratos mais claros;
- maior segurança durante refatorações.

O TypeScript deverá utilizar configuração estrita.

Preferencialmente:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

Não será adotado `any` como solução padrão.

Quando um tipo desconhecido for necessário, preferir:

```ts
unknown;
```

e validação explícita.

---

# 12. Vite

O frontend será inicializado utilizando Vite.

Responsabilidades:

- desenvolvimento local;
- build;
- suporte ao TypeScript;
- integração com React;
- gerenciamento de variáveis de ambiente do frontend.

A configuração deverá permanecer simples inicialmente.

---

# 13. Tailwind CSS 4

Tailwind CSS 4 será utilizado para estilização.

A aplicação deverá utilizar a configuração recomendada pela versão atual do Tailwind.

Os estilos deverão ser organizados de forma consistente.

Componentes reutilizáveis devem concentrar padrões visuais comuns.

Não criar uma grande quantidade de CSS global sem necessidade.

---

# 14. Express

Express será utilizado como framework HTTP do backend.

Responsabilidades:

- criação da aplicação HTTP;
- rotas;
- middlewares;
- tratamento de requests;
- tratamento de responses;
- integração das camadas da aplicação.

A configuração deverá separar:

```text
app.ts
server.ts
```

`app.ts` será responsável pela configuração da aplicação Express.

`server.ts` será responsável por iniciar o servidor.

---

# 15. Separação entre `app.ts` e `server.ts`

Estrutura:

```text
src/
├── app.ts
└── server.ts
```

`app.ts`:

```text
criação do Express
middlewares
routes
error handling
```

`server.ts`:

```text
database connection
start server
```

Essa separação facilita testes da aplicação sem necessariamente iniciar o servidor HTTP.

---

# 16. MongoDB

MongoDB será o banco de dados principal.

O banco será utilizado para armazenar:

```text
users
wallets
websites
transactions
goals
```

Não haverá collection própria para Assets.

Assets serão obtidos através da integração com o serviço de Market Data.

Não haverá collection própria para Portfolio.

Portfolio será uma visão derivada.

---

# 17. Mongoose

Mongoose será utilizado como ODM para MongoDB.

Responsabilidades:

- definição dos schemas;
- definição dos models;
- queries;
- índices;
- validações estruturais;
- acesso ao MongoDB.

A lógica principal do domínio não deverá ficar concentrada nos Models.

A regra de negócio pertence aos Services.

---

# 18. Conexão com MongoDB

A conexão será centralizada.

Exemplo conceitual:

```text
config/
└── database.ts
```

Fluxo:

```text
server.ts
   ↓
database connection
   ↓
MongoDB
   ↓
Express server
```

A aplicação não deve iniciar normalmente sem conseguir estabelecer a conexão necessária com o banco.

---

# 19. Variáveis de ambiente

Informações sensíveis ou específicas do ambiente não devem ser armazenadas diretamente no código.

Serão utilizados arquivos:

```text
frontend/.env
frontend/.env.example

backend/.env
backend/.env.example
```

Os arquivos `.env` reais não devem ser commitados.

Os arquivos `.env.example` devem ser commitados.

---

# 20. Variáveis do backend

Exemplo inicial:

```env
NODE_ENV=development
PORT=3000

MONGODB_URI=

CLERK_SECRET_KEY=

COINGECKO_API_KEY=
```

Variáveis adicionais poderão ser adicionadas conforme as integrações forem implementadas.

---

# 21. Variáveis do frontend

Exemplo inicial:

```env
VITE_API_URL=http://localhost:3000

VITE_CLERK_PUBLISHABLE_KEY=
```

Somente informações que podem ser expostas ao navegador devem ser utilizadas no frontend.

Secrets nunca devem ser colocados em variáveis `VITE_*`.

---

# 22. `.gitignore`

O repositório deverá ignorar:

```text
node_modules/
dist/
.env
.env.*
!.env.example
coverage/
logs/
```

Arquivos específicos de IDE e sistema operacional também deverão ser ignorados.

---

# 23. Clerk

Clerk será utilizado para autenticação e gerenciamento de identidade.

Responsabilidades:

- signup;
- login;
- logout;
- sessão;
- alteração de senha;
- reset de senha;
- gerenciamento da identidade do usuário.

O APM SYN não implementará autenticação de senha própria.

---

# 24. User interno

Apesar do Clerk gerenciar a identidade, o APM SYN manterá um documento `User` no MongoDB.

O usuário interno será associado ao usuário do Clerk através do identificador do Clerk.

Conceito:

```text
Clerk User
    │
    │ clerkId
    ▼
APM SYN User
    │
    ├── Wallets
    ├── Websites
    ├── Transactions
    └── Goals
```

O documento interno poderá armazenar dados específicos do APM SYN que não pertencem ao provedor de autenticação.

---

# 25. Autenticação do backend

As rotas protegidas deverão passar pelo middleware de autenticação.

Fluxo:

```text
Request
   ↓
Clerk token
   ↓
Auth Middleware
   ↓
identidade validada
   ↓
User interno
   ↓
Controller
```

O backend nunca deve confiar apenas no `userId` enviado pelo frontend.

A identidade deve ser obtida a partir da autenticação validada.

---

# 26. Zod

Zod será utilizado em frontend e backend.

Frontend:

```text
validação de formulários
```

Backend:

```text
validação de requests
```

O backend sempre fará sua própria validação.

A validação do frontend não é considerada mecanismo de segurança.

---

# 27. TanStack Query

TanStack Query será configurado como provider global no frontend.

Responsável pelo server state:

```text
queries
mutations
cache
loading
errors
refetch
invalidation
```

O cache será invalidado após operações que alterem os dados.

---

# 28. Zustand

Zustand será configurado para estados de interface.

Exemplos:

```text
sidebar
modal
preferências
estado temporário de UI
```

Não será utilizado como banco de dados local.

Também não substituirá TanStack Query.

---

# 29. API Client

O frontend deverá possuir um cliente HTTP centralizado.

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

O cliente será responsável por:

- URL base;
- headers;
- autenticação;
- parsing de respostas;
- tratamento inicial de erros.

---

# 30. CORS

O backend deverá permitir requisições somente das origens autorizadas.

Em desenvolvimento:

```text
frontend → backend local
```

Em produção:

```text
frontend production → backend production
```

Não utilizar `*` indiscriminadamente em produção.

---

# 31. Health Check

A API deverá possuir um endpoint simples para verificar se está funcionando.

Exemplo:

```text
GET /health
```

Resposta conceitual:

```json
{
  "status": "ok"
}
```

Esse endpoint não deverá exigir autenticação.

Ele poderá ser utilizado para:

- desenvolvimento;
- monitoramento;
- deploy;
- diagnóstico.

---

# 32. Tratamento de erros

O backend terá um middleware centralizado de erros.

Estrutura:

```text
Request
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Error
   ↓
Error Middleware
   ↓
HTTP Response
```

Os erros deverão possuir estrutura consistente.

Exemplo:

```json
{
  "error": {
    "code": "WALLET_NOT_FOUND",
    "message": "Wallet not found"
  }
}
```

Os códigos de erro deverão ser estáveis e não depender apenas do texto da mensagem.

---

# 33. Logging

O backend deverá possuir logging suficiente para diagnosticar problemas.

Os logs não devem registrar:

- senhas;
- tokens;
- secrets;
- chaves de API;
- informações sensíveis desnecessárias.

Em desenvolvimento, logs podem ser mais detalhados.

Em produção, devem ser controlados.

---

# 34. API e versionamento

A API deverá possuir uma versão explícita.

Estrutura inicial:

```text
/api/v1
```

Exemplo:

```text
/api/v1/wallets
/api/v1/websites
/api/v1/transactions
```

Isso permitirá evolução futura sem quebrar clientes antigos.

---

# 35. Scripts do frontend

O `package.json` deverá possuir scripts para as tarefas principais.

Exemplo:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

Os scripts podem ser ajustados conforme as ferramentas definitivas forem instaladas.

---

# 36. Scripts do backend

Exemplo:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint .",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

---

# 37. Lint

ESLint será utilizado para identificar problemas no código.

Deverá existir configuração independente para frontend e backend quando necessário.

O lint deverá ser executado antes de commits importantes.

---

# 38. Formatação

O projeto deverá utilizar uma ferramenta de formatação consistente, preferencialmente Prettier.

Objetivo:

- formatação automática;
- código consistente;
- menor quantidade de alterações puramente estéticas em PRs/commits.

---

# 39. Testes

O projeto deverá possuir testes desde o início.

Prioridade:

```text
1. regras de negócio
2. operações financeiras
3. Services
4. API
5. componentes importantes
6. fluxos críticos
```

As operações financeiras são especialmente importantes porque erros podem produzir inconsistência nos dados.

---

# 40. Testes das operações financeiras

Deverão existir testes para operações como:

```text
depositToWallet()
withdrawFromWallet()
transferBetweenWallets()
adjustWallet()
recordEarning()
withdrawFromWebsite()
```

Também deverão existir testes para cenários inválidos.

Exemplos:

```text
Wallet inexistente
Website inexistente
Asset inválido
Quantidade inválida
Transferência para a própria Wallet
Usuário acessando recurso de outro usuário
Transaction inconsistente
```

---

# 41. Transações MongoDB

Operações que alterem múltiplos documentos de maneira atômica deverão utilizar as capacidades de transação do MongoDB quando necessário.

Principalmente operações que possam envolver:

```text
Transaction
Wallet
Website
```

A operação deve evitar estados parcialmente gravados.

Exemplo:

```text
Website Withdrawal
        │
        ├── criar Transaction
        ├── atualizar dados necessários
        └── concluir operação
```

Se uma etapa crítica falhar, a operação deverá ser revertida quando estiver dentro de uma transação MongoDB.

---

# 42. Regra sobre Wallet.balance

A arquitetura deve preservar a decisão definida anteriormente:

As operações financeiras não devem depender de alterações manuais no `Wallet.balance` para representar uma operação.

As Transactions são a fonte da verdade financeira.

Qualquer campo derivado utilizado por performance deverá ser tratado como dado derivado e possuir estratégia clara de sincronização/reconstrução.

---

# 43. Primeira implementação

A primeira implementação não começará diretamente pelas features financeiras.

O primeiro objetivo será validar toda a infraestrutura.

Fluxo:

```text
Frontend
   ↓
Clerk
   ↓
Backend
   ↓
Auth Middleware
   ↓
MongoDB
   ↓
User
```

O primeiro fluxo funcional deverá permitir:

1. criar uma conta;
2. autenticar;
3. acessar uma rota protegida;
4. criar/sincronizar o User interno;
5. obter o perfil;
6. fazer logout.

---

# 44. Primeiro endpoint funcional

Após configurar a infraestrutura, o primeiro endpoint funcional protegido deverá ser relacionado ao User.

Exemplo conceitual:

```text
GET /api/v1/users/me
```

Objetivo:

```text
Clerk
   ↓
Auth Middleware
   ↓
User
   ↓
Profile
```

Isso valida:

- frontend;
- Clerk;
- token;
- backend;
- middleware;
- MongoDB;
- Mongoose;
- repository;
- service;
- controller;
- API client.

---

# 45. Ordem inicial de implementação

A implementação inicial seguirá aproximadamente esta ordem:

```text
1. Criar repositório
        ↓
2. Criar frontend
        ↓
3. Criar backend
        ↓
4. Configurar TypeScript
        ↓
5. Configurar Tailwind
        ↓
6. Configurar Express
        ↓
7. Configurar MongoDB/Mongoose
        ↓
8. Configurar Clerk
        ↓
9. Configurar Zod
        ↓
10. Configurar TanStack Query
        ↓
11. Configurar Zustand
        ↓
12. Configurar API Client
        ↓
13. Configurar CORS
        ↓
14. Configurar Error Handling
        ↓
15. Criar /health
        ↓
16. Implementar User
        ↓
17. Testar autenticação ponta a ponta
        ↓
18. Implementar Wallet
        ↓
19. Implementar Transaction
        ↓
20. Implementar Website
        ↓
21. Implementar Website → Wallet
        ↓
22. Implementar Portfolio
        ↓
23. Implementar Goals
        ↓
24. Implementar Market Data
```

A ordem poderá ser ajustada conforme decisões técnicas encontradas durante a implementação.

---

# 46. Primeiro milestone

O primeiro milestone técnico será:

```text
APM SYN Foundation
```

Critérios:

```text
[ ] Repositório criado
[ ] Frontend funcionando
[ ] Backend funcionando
[ ] TypeScript configurado
[ ] Tailwind configurado
[ ] MongoDB conectado
[ ] Mongoose configurado
[ ] Clerk configurado
[ ] Auth middleware funcionando
[ ] Zod configurado
[ ] TanStack Query configurado
[ ] Zustand configurado
[ ] API Client configurado
[ ] CORS configurado
[ ] Error handling configurado
[ ] GET /health funcionando
[ ] User criado/sincronizado
[ ] GET /api/v1/users/me funcionando
[ ] Login funcionando
[ ] Signup funcionando
[ ] Logout funcionando
```

---

# 47. Primeiro fluxo completo

Ao finalizar o primeiro milestone:

```text
Usuário
   │
   ▼
Signup/Login
   │
   ▼
Clerk
   │
   ▼
Frontend
   │
   ▼
API
   │
   ▼
Auth Middleware
   │
   ▼
User Service
   │
   ▼
User Repository
   │
   ▼
MongoDB
```

Esse fluxo será a primeira validação completa da arquitetura.

---

# 48. Segundo milestone

Depois da infraestrutura:

```text
Wallet Foundation
```

Incluindo:

```text
[ ] Wallet Model
[ ] Wallet Repository
[ ] Wallet Service
[ ] Wallet Controller
[ ] Wallet Routes
[ ] Wallet Schemas
[ ] Wallet UI
[ ] Wallet Queries
[ ] Wallet Mutations
[ ] Criar Wallet
[ ] Listar Wallets
[ ] Consultar Wallet
[ ] Editar Wallet
[ ] Arquivar Wallet
```

Ainda sem implementar todos os fluxos financeiros.

---

# 49. Terceiro milestone

```text
Transaction Foundation
```

Incluindo:

```text
[ ] Transaction Model
[ ] Transaction Repository
[ ] Transaction Service
[ ] Transaction Controller
[ ] Transaction Routes
[ ] Transaction Schemas
[ ] Listagem
[ ] Consulta
[ ] Filtros
[ ] Ordenação
[ ] Paginação
```

Depois disso serão implementadas as operações financeiras.

---

# 50. Quarto milestone

```text
Website Foundation
```

Incluindo:

```text
[ ] Website Model
[ ] Website Repository
[ ] Website Service
[ ] Website Controller
[ ] Website Routes
[ ] Website Schemas
[ ] Website UI
[ ] CRUD
[ ] Earnings
[ ] Withdrawals
```

---

# 51. Quinto milestone — SYN Core

Este será o primeiro grande diferencial do APM SYN.

```text
Website
   ↓
Withdrawal
   ↓
Wallet
   ↓
Asset
   ↓
Transaction
```

Fluxo:

```text
Usuário informa:

Website
Wallet
Asset
Quantidade

        ↓

Uma única operação

        ↓

Transaction criada

        ↓

Dados financeiros sincronizados
```

Este fluxo deverá possuir testes abrangentes.

---

# 52. Sexto milestone

```text
Portfolio
```

O Portfolio será construído a partir dos dados financeiros existentes.

Não será criado como uma entidade independente.

---

# 53. Sétimo milestone

```text
Goals
```

Goals serão implementados depois que Transactions estiverem funcionando corretamente.

Fluxo:

```text
Transactions
      ↓
Elegibilidade
      ↓
Goal
      ↓
Progress
      ↓
Snapshot
```

---

# 54. Market Data

A integração de Market Data poderá ser implementada antes ou durante o SYN Core, pois o fluxo de retirada necessita da seleção de Assets.

O frontend não deverá possuir uma lista fixa de Assets como no APM Lite.

O catálogo deverá vir de uma API externa.

Fluxo:

```text
Frontend
   ↓
APM SYN API
   ↓
CoinGecko API
   ↓
Assets
```

---

# 55. Desenvolvimento local

Durante o desenvolvimento:

```text
Frontend
http://localhost:5173

Backend
http://localhost:3000

MongoDB
local ou serviço de desenvolvimento
```

As portas poderão ser alteradas caso necessário.

---

# 56. Ambiente de produção

Frontend e backend serão tratados como aplicações independentes.

Conceito:

```text
Frontend
   ↓
Production API
   ↓
MongoDB Production
```

Clerk e Market Data deverão utilizar suas respectivas configurações de produção.

Secrets de produção nunca serão armazenados no Git.

---

# 57. Desenvolvimento × produção

Nunca utilizar credenciais de produção no ambiente de desenvolvimento.

Separar:

```text
Development
Production
```

Principalmente:

```text
MongoDB
Clerk
Market Data
API URLs
Secrets
```

---

# 58. Princípios de segurança

Nunca armazenar no Git:

```text
senhas
tokens
API keys
Clerk secrets
MongoDB credentials
```

Nunca expor:

```text
CLERK_SECRET_KEY
COINGECKO_API_KEY
MONGODB_URI
```

no frontend.

Somente valores explicitamente destinados ao navegador podem existir em variáveis `VITE_*`.

---

# 59. Princípios de desenvolvimento

O código deve seguir:

```text
Single Responsibility
Separation of Concerns
DRY quando apropriado
baixo acoplamento
alta coesão
tipagem forte
validação explícita
```

Evitar abstrações prematuras.

A arquitetura deve ser suficientemente organizada para crescer, mas sem criar complexidade sem necessidade.

---

# 60. Regra de ouro

Antes de implementar uma nova feature, identificar:

```text
Onde pertence a regra?
Onde pertence o dado?
Quem é responsável pela operação?
```

Exemplo:

```text
Regra financeira
→ Service

Persistência
→ Repository

MongoDB schema
→ Model

HTTP
→ Controller/Route

Formulário
→ Frontend

Server state
→ TanStack Query

UI state
→ Zustand
```

---

# 61. Resultado esperado

Ao concluir o setup inicial, o APM SYN deverá possuir uma base capaz de evoluir sem alterar sua arquitetura fundamental.

A estrutura deverá permitir:

```text
React
   ↓
API
   ↓
Domain Services
   ↓
Repositories
   ↓
MongoDB
```

com:

```text
Clerk
→ autenticação

Zod
→ validação

TanStack Query
→ server state

Zustand
→ UI state

Mongoose
→ MongoDB

Market Data
→ catálogo/preços de Assets
```

O setup inicial termina quando a infraestrutura estiver funcionando e o primeiro fluxo autenticado de User estiver validado de ponta a ponta.
````
