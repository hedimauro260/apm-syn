# APM SYN — Backend

API Express para o projeto APM SYN (Assets Portfolio Manager Synchronization).

## 📋 Visão Geral

O backend é a espinha dorsal do APM SYN, responsável por:

- Autenticação via Clerk
- Gerenciamento de dados de portfólio (Wallets, Websites, Transactions, Goals)
- Sincronização de dados de mercado via CoinGecko API
- API REST versionada com Zod para validação de schemas
- Logging estruturado com pino

## 🛠️ Stack

- **Runtime:** Node.js 24
- **Framework:** Express
- **Linguagem:** TypeScript
- **Banco de Dados:** MongoDB + Mongoose
- **Validação:** Zod 4
- **Auth:** Clerk
- **Logging:** pino + pino-http
- **Testes:** Vitest + Supertest
- **Lint:** ESLint
- **Format:** Prettier

## ⚡ Requisitos

- Node.js `>=24.18.0`
- npm `11.x`
- MongoDB rodando (localmente ou via Docker)

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Rodar em desenvolvimento
npm run dev          # http://localhost:3000

# Build
npm run build        # tsc -> dist/

# Produção
npm start            # node dist/server.js
```

## 📜 Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor em modo desenvolvimento com tsx watch |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Inicia servidor em produção |
| `npm test` | Roda testes com Vitest |
| `npm run test:run` | Roda testes uma única vez |
| `npm run test:coverage` | Roda testes com cobertura |
| `npm run lint` | Executa ESLint |
| `npm run lint:fix` | Corrige problemas de lint |
| `npm run format` | Formata com Prettier |
| `npm run typecheck` | Validação de tipos TypeScript |
| `npm run validate` | Pipeline completo: lint + typecheck + test + build |

## 📡 Endpoints

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/health` | Health check | Não |
| GET | `/api/v1/health` | Health versionado | Não |

## 🐳 Docker

O backend pode ser executado via Docker Compose:

```bash
docker-compose up -d
```

O `Dockerfile` utiliza multi-stage build:
1. **Builder:** compila o TypeScript
2. **Runner:** executa em `node:24-alpine` com usuário não-root

## 📁 Estrutura de Arquivos

```
backend/
├── src/               # Código fonte
├── tests/             # Testes
├── scripts/           # Scripts auxiliares
├── docs/              # Documentação interna
├── dist/              # Build compilado
├── Dockerfile
├── .env.example
├── eslint.config.js
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/apm-syn-dev
MONGODB_MAX_RETRIES=3
MONGODB_RETRY_DELAY_MS=1000
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
COINGECKO_API_KEY=
```

## 📚 Documentação

Consulte a documentação do projeto na raiz em `docs/` para visão geral da arquitetura e especificação da API.

## 📜 Licença

MIT — ver `LICENSE` na raiz do projeto.
