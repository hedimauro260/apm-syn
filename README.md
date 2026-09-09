# APM SYN — Assets Portfolio Manager Synchronization

Evolução do APM Lite: uma operação financeira registrada uma única vez, sincronizada automaticamente entre Wallet / Website / Portfolio / Goals.

## 🚀 Visão Geral

APM SYN é uma plataforma de gerenciamento de portfólio de ativos que sincroniza automaticamente dados financeiros entre múltiplas fontes (Wallets, Websites, Portfolio e Goals), com dados de mercado em tempo real via CoinGecko.

## 📦 Stack

- **Backend:** Node.js 24 + Express + TypeScript + MongoDB/Mongoose + Zod 4 + Clerk + pino
- **Frontend:** React + Vite + Tailwind 4 + TanStack Query + Zustand + Zod + Clerk
- **Market Data:** CoinGecko API via backend

## 🏗️ Estrutura do Projeto

```
apm-syn/
├── backend/         # API Express (Fase 0 concluída)
├── frontend/        # Aplicação React (em desenvolvimento)
├── docs/            # Documentação técnica
├── docker-compose.yml
├── .nvmrc
├── .gitignore
├── package.json
└── README.md
```

## ⚡ Requisitos

- Node.js `24.18.0` (`nvm use` / `fnm use`)
- npm `11.x`

## 🖥️ Executando Localmente

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev      # http://localhost:3000
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev      # http://localhost:5173
```

### Com Docker Compose
```bash
docker-compose up -d
```

### Com scripts raiz
```bash
npm run dev              # Backend + Frontend simultaneamente
npm run build            # Build de ambos
npm run lint             # Lint de ambos
npm run typecheck        # Typecheck de ambos
npm run test             # Testes do backend
npm run validate         # Lint + typecheck + test + build
```

## 📡 Endpoints (Backend — Fase 0)

- `GET /health` — health check (sem auth)
- `GET /api/v1/health` — health versionado

## 📚 Documentação

Ver `docs/`:
- `architecture.md` — arquitetura frontend/backend
- `api.md` — especificação da API
- `implementation-setup.md` — setup e milestones

## 📁 Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Roda backend e frontend em paralelo |
| `npm run build` | Build de ambos os projetos |
| `npm run lint` | Lint de ambos |
| `npm run typecheck` | Typecheck de ambos |
| `npm run test` | Testes do backend |
| `npm run validate` | Pipeline completo de validação |

## 🐳 Docker

O projeto utiliza Docker Compose para orquestrar o backend e o MongoDB:

- **Backend:** porta `3000`, depende do MongoDB estar saudável
- **MongoDB:** imagem `mongo:7`, volume persistente `mongo-data`

## 📜 Licença

MIT — ver `LICENSE`.
