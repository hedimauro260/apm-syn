# APM SYN — Assets Portfolio Manager Synchronization

Evolução do APM Lite: uma operação financeira registrada uma única vez, sincronizada automaticamente entre Wallet / Website / Portfolio / Goals.

## Stack

- **Backend:** Node.js 24 + Express + TypeScript + MongoDB/Mongoose + Zod 4 + Clerk + pino
- **Frontend:** React + Vite + Tailwind 4 + TanStack Query + Zustand + Zod + Clerk (planejado)
- **Market Data:** CoinGecko API via backend

## Estrutura

```
apm-syn/
├── backend/   # API Express (Fase 0 concluída)
├── frontend/  # (planejado)
├── docs/
├── .nvmrc
├── .gitignore
└── README.md
```

## Requisitos

- Node.js `24.18.0` (`nvm use` / `fnm use`)
- npm `11.x`

## Backend — Desenvolvimento (Fase 0)

```bash
cd backend
cp .env.example .env
npm install
npm run dev      # http://localhost:3000
```

Endpoints:

- `GET /health` — health check (sem auth)
- `GET /api/v1/health` — health versionado

```bash
npm run build    # tsc -> dist/
npm start        # node dist/server.js
npm run lint
npm run format
npm run typecheck
```

## Documentação

Ver `docs/`:

- `project-overview.md` — visão do produto
- `architecture.md` — arquitetura frontend/backend
- `api.md` — especificação da API
- `implementation-setup.md.md` — setup e milestones

## Licença

MIT — ver `LICENSE`.
