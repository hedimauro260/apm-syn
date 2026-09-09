# APM SYN — Frontend

Aplicação React para o projeto APM SYN (Assets Portfolio Manager Synchronization).

## 📋 Visão Geral

O frontend é a interface do usuário do APM SYN, construída com React e Vite, oferecendo uma experiência responsiva com design system baseado em Tailwind CSS e TanStack Query para gerenciamento de estado server-side.

## 🛠️ Stack

- **Framework:** React 19 + React Router DOM 7
- **Build:** Vite
- **Estilização:** Tailwind CSS 4
- **Estado cliente:** Zustand
- **Query server:** TanStack Query (React Query)
- **Validação:** Zod 4
- **Auth:** Clerk (Clerk React)
- **Componentes UI:** Radix UI + Lucide React
- **Gráficos:** Recharts
- **Data:** date-fns, es-toolkit
- **Lint:** Oxlint
- **TypeScript:** 6.x

## ⚡ Requisitos

- Node.js `>=24.18.0`
- npm `11.x`

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Rodar em desenvolvimento
npm run dev          # http://localhost:5173

# Build
npm run build        # tsc -b && vite build

# Preview da build
npm run preview
```

## 📜 Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento Vite com HMR |
| `npm run build` | Compila TypeScript e build do Vite |
| `npm run preview` | Preview da build de produção |
| `npm run lint` | Executa Oxlint |
| `npm run typecheck` | Validação de tipos TypeScript |

## 📡 Integração com Backend

O frontend se comunica com a API via variável de ambiente `VITE_API_URL`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 📁 Estrutura de Arquivos

```
frontend/
├── src/               # Código fonte
├── public/            # Assets estáticos
├── docs/              # Documentação interna
├── dist/              # Build compilado
├── index.html
├── .env.example
├── .oxlintrc.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── package.json
```

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_CLERK_PUBLISHABLE_KEY=
VITE_APP_ENV=development
```

## 🎨 Design System

O frontend utiliza:
- **Tailwind CSS 4** para estilização com tokens de design
- **Radix UI** para componentes acessíveis prontos
- **Lucide React** para ícones
- **clsx + class-variance-authority** para composição de classes

## 📚 Documentação

Consulte a documentação do projeto na raiz em `docs/` para visão geral da arquitetura.

## 📜 Licença

MIT — ver `LICENSE` na raiz do projeto.
