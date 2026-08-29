# APM SYN Frontend — Development Log

Registro de todas as implementações realizadas no frontend do APM SYN.

---

## 2026-08-25 — Fase 0.1: Estrutura de Pastas e Documentação Inicial

**Fase:** 0 — Arquitetura e Setup

**Descrição:** Criação da estrutura inicial de pastas e documentos de arquitetura do frontend.

**Arquivos criados:**

```text
frontend/
frontend/docs/
frontend/docs/architecture.md
frontend/docs/dev-log.md
```

**Detalhes:**

- Criada a pasta `frontend/` na raiz do projeto
- Criada a pasta `frontend/docs/` para documentação do frontend
- Criado `architecture.md` com o roadmap completo de 18 fases (0-17), stack tecnológica, estrutura de diretórios, convenções, princípios arquiteturais e fluxo de dados
- Criado `dev-log.md` para registro de todas as implementações a partir desta

**Observações:**

- O `architecture.md` foi escrito em português, seguindo o estilo dos documentos existentes em `docs/`
- O roadmap foi baseado na proposta de desenvolvimento por fases fornecida
- A estrutura de diretórios segue o padrão definido em `docs/architecture.md` (seções 6-11)
- A stack foi alinhada com a documentação existente (Clerk, TanStack Query, Zustand, Zod)

---

## 2026-08-25 — Fase 0.2: Projeto Vite + React + TypeScript + Tailwind CSS 4

**Fase:** 0 — Arquitetura e Setup

**Descrição:** Criação do projeto frontend com Vite, configuração de React, TypeScript, Tailwind CSS 4 e instalação das dependências-base.

**Arquivos criados/modificados:**

```text
frontend/package.json
frontend/vite.config.ts
frontend/tsconfig.json
frontend/tsconfig.app.json
frontend/tsconfig.node.json
frontend/index.html
frontend/src/main.tsx
frontend/src/App.tsx
frontend/src/index.css
frontend/.gitignore
frontend/.oxlintrc.json
```

**Dependências instaladas:**

```text
React               ^19.2.8
React DOM           ^19.2.8
TypeScript          ~6.0.2
Vite                ^8.2.2
Tailwind CSS        ^4.3.3
@tailwindcss/vite   ^4.3.3
react-router-dom    ^7.18.2
@tanstack/react-query ^5.102.3
@clerk/clerk-react  ^5.61.9
zod                 ^4.4.3
react-hook-form     ^7.86.0
@hookform/resolvers ^5.9.1
lucide-react        ^1.34.0
date-fns            ^4.4.0
clsx                ^2.1.1
```

**Configurações realizadas:**

- Vite configurado com plugin `@tailwindcss/vite`
- `src/index.css` configurado com `@import "tailwindcss"`
- `App.tsx` simplificado com classes Tailwind
- Removidos templates padrão do Vite (App.css, assets padrão)

**Validação:**

```text
npm run build   → ✅ sucesso (tsc + vite build)
npm run lint    → ✅ 0 warnings, 0 errors
```

**Checklist Fase 0:**

```text
[ x ] React + Vite funcionando
[ x ] TypeScript configurado
[ x ] Tailwind CSS 4 funcionando
```

---

## 2026-08-25 — Fase 0.3: Estrutura de Diretórios + Alias @/ + Environment Variables

**Fase:** 0 — Arquitetura e Setup

**Descrição:** Organização da estrutura src/, configuração do alias @/, criação de environment variables com validação Zod e adição do script typecheck.

**Arquivos criados:**

```text
frontend/.env
frontend/.env.example
frontend/src/config/env.ts
frontend/src/app/providers/        (diretório)
frontend/src/app/router/           (diretório)
frontend/src/components/ui/        (diretório)
frontend/src/config/               (diretório)
frontend/src/features/             (diretório)
frontend/src/hooks/                (diretório)
frontend/src/lib/                  (diretório)
frontend/src/services/api/         (diretório)
frontend/src/styles/               (diretório)
frontend/src/types/                (diretório)
```

**Arquivos modificados:**

```text
frontend/vite.config.ts            (alias @/)
frontend/tsconfig.app.json         (paths @/*)
frontend/package.json              (script typecheck)
frontend/.gitignore                (adicionado .env)
```

**Configurações realizadas:**

- Alias `@/` configurado no Vite (`resolve.alias`) e no TypeScript (`paths`)
- Criado `src/config/env.ts` com validação Zod das variáveis de ambiente
- Variáveis de ambiente: `VITE_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_APP_ENV`
- Adicionado script `typecheck` (`tsc --noEmit`) ao package.json
- `.env` adicionado ao `.gitignore`

**Validação:**

```text
npm run typecheck  → ✅ sucesso
npm run lint       → ✅ 0 warnings, 0 errors
npm run build      → ✅ sucesso
```

**Checklist:**

```text
[ x ] Alias @/ funcionando
[ x ] Estrutura de diretórios criada
[ x ] Environment variables validadas
```

---

## 2026-08-25 — Fase 0.4: Providers + TanStack Query + API Client Base

**Fase:** 0 — Arquitetura e Setup

**Descrição:** Configuração dos providers globais (Clerk + TanStack Query) e criação do API Client base para comunicação com o backend.

**Arquivos criados:**

```text
frontend/src/app/providers/query-provider.tsx
frontend/src/app/providers/clerk-provider.tsx
frontend/src/app/providers/app-providers.tsx
frontend/src/services/api/client.ts
frontend/src/services/api/errors.ts
frontend/src/services/api/types.ts
```

**Arquivos modificados:**

```text
frontend/src/main.tsx               (AppProviders no render)
```

**Configurações realizadas:**

- **QueryProvider:** QueryClient com staleTime 30s, retry 1, refetchOnWindowFocus false
- **ClerkProvider:** Wraps ClerkProvider com publishableKey do env
- **AppProviders:** Composição ClerkProvider > QueryProvider > children
- **main.tsx:** StrictMode > AppProviders > App
- **API Client:** Função `apiClient<T>()` com suporte a token, headers, tratamento de 204 No Content e erros
- **ApiError:** Classe de erro com status, code e details
- **Tipos:** ApiErrorResponse, PaginationMeta, PaginatedResponse, ApiResponse

**Fluxo de autenticação:**

```text
Component
    ↓
useAuth() (Clerk)
    ↓
getToken()
    ↓
apiClient(path, { token })
    ↓
Authorization: Bearer token
    ↓
Backend
```

**Validação:**

```text
npm run typecheck  → ✅ sucesso
npm run lint       → ✅ 0 warnings, 0 errors
npm run build      → ✅ sucesso
```

**Checklist:**

```text
[ x ] ClerkProvider preparado
[ x ] TanStack Query configurado
[ x ] API Client base criado
```

---

## 2026-08-25 — Fase 0.5: Router + Páginas-Base + Layouts

**Fase:** 0 — Arquitetura e Setup

**Descrição:** Configuração do React Router com rotas públicas, páginas-base e layouts. Conclusão da Fase 0 — Arquitetura e Setup.

**Arquivos criados:**

```text
frontend/src/app/router/index.tsx
frontend/src/pages/home-page.tsx
frontend/src/pages/app-page.tsx
frontend/src/pages/not-found-page.tsx
frontend/src/layouts/app-layout.tsx
```

**Arquivos modificados:**

```text
frontend/src/App.tsx                   (RouterProvider)
```

**Rotas configuradas:**

```text
/           → HomePage (página pública)
/app        → AppLayout > AppLayout (rota interna)
*           → NotFoundPage (404)
```

**Fluxo de renderização:**

```text
main.tsx
  ↓
StrictMode
  ↓
AppProviders (Clerk + Query)
  ↓
App
  ↓
RouterProvider
  ↓
Routes
  ├── /         → HomePage
  ├── /app      → AppLayout > Outlet > AppPage
  └── *         → NotFoundPage
```

**Observações:**

- A rota `/app` ainda não possui proteção (ProtectedRoute será implementado na Fase 2)
- AppLayout é minimalista (apenas Outlet), evoluirá na Fase 4 com Sidebar/Header
- Páginas são intencionalmente simples — design system será implementado na Fase 1

**Validação:**

```text
npm run typecheck  → ✅ sucesso
npm run lint       → ✅ 0 warnings, 0 errors
npm run build      → ✅ sucesso
```

**Checklist Fase 0 completo:**

```text
[ x ] React + Vite funcionando
[ x ] TypeScript configurado
[ x ] Tailwind CSS 4 funcionando

[ x ] Estrutura inicial definida
[ x ] Alias @/ funcionando
[ x ] Environment variables centralizadas
[ x ] Environment variables validadas com Zod

[ x ] TanStack Query configurado
[ x ] ClerkProvider configurado
[ x ] AppProviders centralizado

[ x ] API Client base criado
[ x ] ApiError padronizado
[ x ] Tipos genéricos da API definidos

[ x ] Router configurado
[ x ] Estrutura pages definida
[ x ] Estrutura layouts definida
[ x ] Home route funcionando
[ x ] App route funcionando
[ x ] 404 funcionando

[ x ] npm run dev
[ x ] npm run typecheck
[ x ] npm run lint
[ x ] npm run build
```

---

## 2026-08-25 — Fase 1.1: Design Tokens no Código

**Fase:** 1 — Design System e Layout Base

**Descrição:** Implementação completa dos design tokens: cores semânticas (Dark/Light/System), tipografia, spacing, radius, shadows e tabular-nums para valores financeiros.

**Arquivos modificados:**

```text
frontend/src/index.css                   (tokens de tema integrados)
frontend/src/pages/home-page.tsx         (usando tokens + theme toggle)
frontend/src/pages/app-page.tsx          (usando tokens)
frontend/src/pages/not-found-page.tsx    (usando tokens)
frontend/src/layouts/app-layout.tsx      (usando tokens)
```

**Tokens de cor implementados:**

```text
Background
├── background
├── surface
└── surface-elevated

Foreground
├── foreground
├── foreground-secondary
└── foreground-muted

Border
├── border
└── border-subtle

Brand
├── primary
├── primary-hover
└── primary-foreground

Semantic
├── success / success-hover / success-foreground
├── danger / danger-hover / danger-foreground
├── warning / warning-hover / warning-foreground
└── info / info-hover / info-foreground
```

**Dark theme:**

```text
background: #0b0f14
surface: #111820
surface-elevated: #18212b
foreground: #f1f5f9
primary: #3b82f6
```

**Light theme:**

```text
background: #f8fafc
surface: #ffffff
surface-elevated: #ffffff
foreground: #0f172a
primary: #2563eb
```

**Tipografia:**

```text
font-family: Inter, ui-sans-serif, system-ui, sans-serif
font-size: xs, sm, base, lg, xl, 2xl, 3xl, 4xl
font-weight: normal (400), medium (500), semibold (600), bold (700)
tabular-nums: font-variant-numeric: tabular-nums
```

**Radius:**

```text
sm: 0.25rem
md: 0.375rem
lg: 0.5rem
xl: 0.75rem
full: 9999rem
```

**Shadows:**

```text
sm, md, lg (com variações Dark/Light)
```

**System theme:**

```text
@media (prefers-color-scheme: dark) → aplica tokens dark automaticamente
```

**Validação:**

```text
npm run typecheck  → ✅ sucesso
npm run lint       → ✅ 0 warnings, 0 errors
npm run build      → ✅ sucesso
```

**Checklist:**

```text
[ x ] Tipografia definida
[ x ] Escala tipográfica definida
[ x ] Pesos definidos
[ x ] Tabular numbers configurado

[ x ] Spacing padronizado (Tailwind scale)
[ x ] Radius padronizado
[ x ] Shadows padronizadas

[ x ] Dark funcionando
[ x ] Light funcionando
[ x ] System funcionando
```

---

## 2026-08-25 — Fase 1.2 Bloco 3A: Button + IconButton + Badge

**Fase:** 1 — Design System e Layout Base

**Descrição:** Implementação dos componentes de ação (Button, IconButton) e Badges para o Design System do APM SYN.

**Arquivos criados:**

```text
frontend/src/components/ui/button.tsx
frontend/src/components/ui/icon-button.tsx
frontend/src/components/ui/badge.tsx
frontend/src/components/ui/spinner.tsx
frontend/src/components/ui/index.ts
```

**Arquivos modificados:**

```text
frontend/src/pages/home-page.tsx       (playground atualizado)
frontend/package.json                  (class-variance-authority, @radix-ui/react-slot)
```

**Dependências adicionadas:**

```text
class-variance-authority   ^0.7.1
@radix-ui/react-slot       ^1.2.3
```

### Button

Componente com suporte a:

```text
Variantes: primary, secondary, outline, ghost, danger
Tamanhos: sm (h-8), md (h-10), lg (h-12) — md padrão
Estados: disabled, loading, focus-visible
Polimorfismo: asChild (via Radix Slot)
```

API:

```tsx
<Button>Save</Button>
<Button variant="danger">Delete</Button>
<Button loading>Saving...</Button>
<Button asChild><a href="/link">Link</a></Button>
```

### IconButton

Componente para ações somente por ícone:

```text
Variantes: primary, secondary, outline, ghost, danger
Tamanhos: sm (32px), md (40px), lg (48px) — md padrão
Ícone: sm → 16px, md → 18px, lg → 20px
Exigência: aria-label obrigatório para acessibilidade
```

API:

```tsx
<IconButton aria-label="Edit"><Pencil /></IconButton>
<IconButton variant="danger" aria-label="Delete"><Trash2 /></IconButton>
```

### Badge

Componente para estados e categorias:

```text
Variantes: default, primary, success, warning, danger, info
Tamanhos: sm (px-2, text-xs), md (px-2.5, text-sm) — md padrão
Prop: dot (indicador visual opcional)
Estilo: fundo com transparência + borda suave (bg-{color}/10, border-{color}/20)
```

API:

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning" dot>Pending</Badge>
```

### Spinner

Componente base para estados de carregamento:

```text
Tamanhos: sm (16px), md (20px), lg (28px) — md padrão
Cor: currentColor (herda do contexto pai)
Animação: animate-spin (Tailwind)
Acessibilidade: aria-hidden="true" por padrão
```

### Barrel Export

Criado `index.ts` para facilitar imports:

```tsx
import { Button, Badge, IconButton, Spinner } from "@/components/ui";
```

### Playground

`home-page.tsx` atualizado com seções:

```text
Buttons (variants, sizes, states, with icons)
Icon Buttons (sizes, variants, states)
Badges (variants, sizes, with dot)
Spinner (sizes)
Design Tokens (preview)
```

### Observações

- CVA (class-variance-authority) utilizado para gerenciamento de variantes
- Radix Slot utilizado para polimorfismo (asChild)
- Spinner criado antecipadamente pois é dependência do Button loading
- 3 warnings de lint (fast refresh: export de constants + components no mesmo arquivo) — não-bloqueadores, aceitos deliberadamente

**Validação:**

```text
npm run typecheck  → ✅ sucesso
npm run lint       → ✅ 3 warnings, 0 errors
npm run build      → ✅ sucesso
```

**Checklist 3A:**

```text
[ x ] Button implementado
[ x ] Button variants (primary, secondary, outline, ghost, danger)
[ x ] Button sizes (sm, md, lg)
[ x ] Button loading
[ x ] Button disabled
[ x ] Button focus-visible
[ x ] Button asChild (polimorfismo)

[ x ] IconButton implementado
[ x ] IconButton variants
[ x ] IconButton sizes
[ x ] IconButton loading
[ x ] aria-label

[ x ] Badge implementado
[ x ] Badge variants (default, primary, success, warning, danger, info)
[ x ] Badge sizes (sm, md)
[ x ] Badge dot prop

[ x ] Tokens utilizados
[ x ] Lucide integrado
[ x ] Playground atualizado
[ x ] Spinner implementado

[ x ] typecheck ✓
[ x ] lint ✓
[ x ] build ✓
```

---

## 2026-08-25 — Fase 1.2 Bloco 3B: Input + Label + Textarea + Select + Checkbox

**Fase:** 1 — Design System e Layout Base

**Descrição:** Implementação dos componentes de formulário para o Design System do APM SYN. Foco em composição, acessibilidade e integração futura com React Hook Form/Zod.

**Arquivos criados:**

```text
frontend/src/components/ui/label.tsx
frontend/src/components/ui/input.tsx
frontend/src/components/ui/textarea.tsx
frontend/src/components/ui/select.tsx
frontend/src/components/ui/checkbox.tsx
```

**Arquivos modificados:**

```text
frontend/src/components/ui/index.ts    (barrel export atualizado)
frontend/src/pages/home-page.tsx       (playground com forms)
```

### Label

Componente para rótulos de campos:

```text
Props: htmlFor, required (indicador visual "*")
Estilo: text-sm font-medium text-foreground
Integração: peer-disabled para desabilitar quando Input está disabled
```

API:

```tsx
<Label htmlFor="wallet-name">Wallet name</Label>
<Label required>Required field</Label>
```

### Input

Componente de entrada de texto, próximo ao nativo:

```text
Props: todas as props nativas de <input>
Estado de erro: via aria-invalid (não prop error message)
Focus: ring-2 ring-offset-2
Estilo: h-10 rounded-lg border bg-surface
```

API:

```tsx
<Input id="wallet-name" placeholder="Main Wallet" />
<Input type="number" min="0" step="0.01" />
<Input aria-invalid />
<Input disabled />
```

### Textarea

Componente para texto multi-linha:

```text
Props: todas as props nativas de <textarea>
Estado de erro: via aria-invalid
Resize: resize-y (padrão sensato)
```

API:

```tsx
<Textarea placeholder="Description" rows={3} />
<Textarea disabled />
```

### Select

Wrapper leve do `<select>` nativo:

```text
Props: todas as props nativas de <select>
Aparência: appearance-none com ícone customizado via CSS
Estado de erro: via aria-invalid
```

API:

```tsx
<Select defaultValue="BANK">
  <option value="BANK">Bank</option>
  <option value="CASH">Cash</option>
</Select>
```

### Checkbox

Input checkbox nativo estilizado:

```text
Props: todas as props nativas de <input type="checkbox">
Estilo: h-4 w-4 rounded accent-primary
```

API:

```tsx
<Checkbox id="counts-goal" />
<Checkbox disabled />
```

### Padrão de Estilo Compartilhado

Todos os componentes de formulário compartilham:

```text
Border: border-border
Focus: focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border
Error: aria-invalid:border-danger aria-invalid:focus-visible:ring-danger
Disabled: disabled:cursor-not-allowed disabled:opacity-50
Background: bg-surface
Text: text-sm text-foreground
Placeholder: placeholder:text-foreground-muted
```

### Playground

`home-page.tsx` atualizado com seção "Forms":

```text
Forms
├── Label + Input (Wallet name)
├── Label + Input (Description)
├── Label + Select (Type)
├── Label + Textarea (Notes)
├── Checkbox + Label (Count toward goal)
├── Checkbox + Label (Disabled)
├── States (Normal, Disabled, Error, Read Only)
```

### Integração Futura com React Hook Form

Os componentes foram desenhados para aceitar diretamente:

```tsx
const { register } = useForm();
<Input {...register("name")} aria-invalid={!!errors.name} />
```

Sem necessidade de wrappers ou adaptações.

### Decisões

- **Sem FieldError ainda** — será criado quando houver formulários reais
- **Select nativo** — não substituir por dropdown customizado sem necessidade
- **Checkbox nativo** — acessibilidade garantida pelo HTML
- **Sem FormField** — abstração prematura, criar quando necessário

**Validação:**

```text
npm run typecheck  → ✅ sucesso
npm run lint       → ✅ 3 warnings, 0 errors
npm run build      → ✅ sucesso
```

**Checklist 3B:**

```text
[ x ] Label implementado
[ x ] Label htmlFor
[ x ] Label required indicator

[ x ] Input implementado
[ x ] Input native props
[ x ] Input error state (aria-invalid)
[ x ] Input disabled state
[ x ] Input readonly state
[ x ] Input focus state

[ x ] Textarea implementado
[ x ] Textarea native props
[ x ] Textarea error state
[ x ] Textarea disabled state

[ x ] Select implementado
[ x ] Select native props
[ x ] Select disabled state

[ x ] Checkbox implementado
[ x ] Checkbox native props
[ x ] Checkbox disabled state

[ x ] Acessibilidade
[ x ] htmlFor/id association
[ x ] aria-invalid
[ x ] Keyboard navigation (nativa)

[ x ] Tokens utilizados
[ x ] Playground atualizado

[ x ] typecheck ✓
[ x ] lint ✓
[ x ] build ✓
```

---

## 2026-08-25 — Fase 1.2 Bloco 3C: Card + Separator + Alert

**Fase:** 1 — Design System e Layout Base

**Descrição:** Implementação dos componentes de estrutura visual (Card, Separator) e feedback contextual (Alert) para o Design System do APM SYN.

**Arquivos criados:**

```text
frontend/src/components/ui/card.tsx
frontend/src/components/ui/separator.tsx
frontend/src/components/ui/alert.tsx
```

**Arquivos modificados:**

```text
frontend/src/components/ui/index.ts    (barrel export atualizado)
frontend/src/pages/home-page.tsx       (playground com cards, separator, alerts)
```

### Card

Componente de container para agrupar conteúdo:

```text
Componentes: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
Estilo: rounded-xl border border-border bg-surface
Header: p-6 com flex-col space-y-1.5
Content: p-6 pt-0
Footer: flex items-center p-6 pt-0
```

API:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Portfolio</CardTitle>
    <CardDescription>Current value</CardDescription>
  </CardHeader>
  <CardContent>$128,492.42</CardContent>
  <CardFooter>
    <Button>View details</Button>
  </CardFooter>
</Card>
```

### Separator

Componente visual para dividir seções:

```text
Props: orientation ("horizontal" | "vertical")
Acessibilidade: role="separator" + aria-orientation
Horizontal: h-px w-full
Vertical: h-full w-px
Estilo: bg-border-subtle
```

API:

```tsx
<Separator />
<Separator orientation="vertical" />
```

### Alert

Componente para mensagens contextuals com ícones automáticos:

```text
Componentes: Alert, AlertTitle, AlertDescription
Variantes: info, success, warning, danger
Ícones automáticos (Lucide): Info, CheckCircle, TriangleAlert, CircleAlert
Acessibilidade: role="alert"
Estilo: rounded-xl border p-4 flex gap-3
Cores: bg-{variant}/10 border-{variant}/20
```

API:

```tsx
<Alert variant="info">
  <AlertTitle>Market data updated</AlertTitle>
  <AlertDescription>Values refreshed.</AlertDescription>
</Alert>

<Alert variant="warning">Simple text only.</Alert>
```

### Decisões

- **Card não é clicável** — estrutura visual pura, interatividade fica para feature
- **Separator usa border-subtle** — visual discreto, não domina a página
- **Alert com ícones automáticos** — diferent do Badge, o ícone é parte da linguagem visual
- **role="alert" por padrão** — ajustar se gerar anúncios excessivos em testes
- **Alert não conhece ApiError** — feature transforma erro em mensagem

### Playground

`home-page.tsx` atualizado com:

```text
Cards
├── Portfolio (Card + CardHeader + CardContent + CardFooter)
└── Wallets (lista de valores)

Separator
├── Horizontal
└── Vertical (Wallets | Transactions | Goals)

Alerts
├── info (com título + descrição)
├── success (com título + descrição)
├── warning (texto simples)
└── danger (com título + descrição)
```

Seções anteriores agora separadas visualmente com `<Separator />`.

**Validação:**

```text
npm run typecheck  → ✅ sucesso
npm run lint       → ✅ 4 warnings, 0 errors
npm run build      → ✅ sucesso
```

**Checklist 3C:**

```text
[ x ] Card implementado
[ x ] CardHeader
[ x ] CardTitle
[ x ] CardDescription
[ x ] CardContent
[ x ] CardFooter

[ x ] Separator implementado
[ x ] Separator horizontal
[ x ] Separator vertical

[ x ] Alert implementado
[ x ] AlertTitle
[ x ] AlertDescription
[ x ] Alert info
[ x ] Alert success
[ x ] Alert warning
[ x ] Alert danger
[ x ] Ícones automáticos (Lucide)

[ x ] Acessibilidade
[ x ] role="alert" no Alert
[ x ] role="separator" no Separator
[ x ] aria-orientation

[ x ] Tokens utilizados
[ x ] Lucide integrado
[ x ] Playground atualizado

[ x ] typecheck ✓
[ x ] lint ✓
[ x ] build ✓
```

---

## 2026-08-25 — Fase 1.2 Bloco 3D: Spinner + LoadingState + EmptyState + ErrorState

**Fase:** 1 — Design System e Layout Base

**Descrição:** Implementação dos componentes de feedback visual para estados de carregamento, dados vazios e erros. Define como o APM SYN se comporta enquanto os dados estão chegando, quando não existem dados e quando algo dá errado.

**Arquivos criados:**

```text
frontend/src/components/ui/loading-state.tsx
frontend/src/components/ui/empty-state.tsx
frontend/src/components/ui/error-state.tsx
```

**Arquivos modificados:**

```text
frontend/src/components/ui/index.ts    (barrel export atualizado)
frontend/src/pages/home-page.tsx       (playground com feedback states)
```

### Spinner (já existente)

Componente base criado no 3A, validado neste bloco:

```text
Tamanhos: sm (16px), md (20px), lg (28px) — md padrão
Cor: currentColor
Animação: animate-spin
Acessibilidade: aria-hidden="true"
```

### LoadingState

Container para estado de carregamento de conteúdo:

```text
Props: children (mensagem opcional)
Acessibilidade: role="status" + aria-live="polite"
Estilo: flex flex-col items-center justify-center gap-3 py-12
Ícone: Spinner lg
```

API:

```tsx
<LoadingState />
<LoadingState>Loading wallets...</LoadingState>
```

### EmptyState

Container para quando não existem dados:

```text
Props: icon (ReactNode opcional), title (obrigatório), description (opcional), action (ReactNode opcional)
Ícone padrão: Inbox (Lucide)
Estilo: flex flex-col items-center justify-center gap-4 py-12
```

API:

```tsx
<EmptyState
  icon={<WalletCards className="h-12 w-12" />}
  title="No wallets yet"
  description="Create your first wallet."
  action={<Button>Create wallet</Button>}
/>
```

### ErrorState

Container para quando a requisição falhou:

```text
Props: icon (ReactNode opcional), title (obrigatório), description (opcional), action (ReactNode opcional)
Ícone padrão: TriangleAlert (Lucide)
Cor: text-danger no ícone
Acessibilidade: role="alert"
Estilo: flex flex-col items-center justify-center gap-4 py-12
```

API:

```tsx
<ErrorState
  title="Unable to load wallets"
  description="Something went wrong."
  action={<Button variant="outline">Try again</Button>}
/>
```

### Decisões

- **Sem Skeleton** — fica para Bloco 4/5 quando tivermos telas reais
- **ErrorState ≠ Alert** — Alert informa, ErrorState representa falha do conteúdo
- **action é ReactNode** — componente não sabe como fazer retry, feature decide
- **icon é ReactNode** — permite usar ícones Lucide ou customizados
- **ErrorState não conhece refetch()** — feature usa `action={<Button onClick={() => refetch()}>Try again</Button>}`

### Integração com TanStack Query (futura)

```tsx
if (isLoading) return <LoadingState>Loading wallets...</LoadingState>;
if (isError) return <ErrorState title="Error" action={<Button onClick={refetch}>Try again</Button>} />;
if (data.length === 0) return <EmptyState title="No data" action={<Button>Create</Button>} />;
return <DataList data={data} />;
```

### Playground

`home-page.tsx` atualizado com seção "Feedback States":

```text
Feedback States
├── Loading (Card + LoadingState com mensagem)
├── Empty (Card + EmptyState com ícone customizado + action)
└── Error (Card + ErrorState com action "Try again")
```

**Validação:**

```text
npm run typecheck  → ✅ sucesso
npm run lint       → ✅ 4 warnings, 0 errors
npm run build      → ✅ sucesso
```

**Checklist 3D:**

```text
[ x ] Spinner verificado (3A)
[ x ] Spinner sizes (sm, md, lg)

[ x ] LoadingState implementado
[ x ] LoadingState mensagem opcional
[ x ] role="status"
[ x ] aria-live="polite"

[ x ] EmptyState implementado
[ x ] EmptyState action (ReactNode)
[ x ] EmptyState icon (ReactNode)

[ x ] ErrorState implementado
[ x ] ErrorState action (ReactNode)
[ x ] ErrorState icon (ReactNode)
[ x ] role="alert"

[ x ] Acessibilidade
[ x ] role="status" no Loading
[ x ] role="alert" no Error
[ x ] aria-hidden no Spinner

[ x ] Dark
[ x ] Light
[ x ] System

[ x ] Playground atualizado

[ x ] typecheck ✓
[ x ] lint ✓
[ x ] build ✓
```

---

## 2026-08-25 — Fase 1.2 Bloco 3E: Playground + Revisão + Encerramento

**Fase:** 1 — Design System e Layout Base

**Descrição:** Criação do playground dedicado do Design System, revisão final de todos os componentes e encerramento oficial da Fase 1.2.

**Arquivos criados:**

```text
frontend/src/pages/ui-playground-page.tsx
```

**Arquivos modificados:**

```text
frontend/src/app/router/index.tsx    (rota /app/ui adicionada)
```

### Playground Page

Rota dedicada `/app/ui` para visualização e teste de todos os componentes:

```text
Seções:
├── Header (título + botão voltar + theme toggle)
├── Buttons (variants, sizes, states, with icons)
├── Icon Buttons (sizes, variants, states)
├── Badges (variants, sizes, with dot)
├── Spinner (sm, md, lg com labels)
├── Forms (Label, Input, Textarea, Select, Checkbox + estados)
├── Cards (Portfolio + Wallets)
├── Separator (horizontal + vertical)
├── Alerts (info, success, warning, danger)
├── Feedback States (Loading, Empty, Error)
├── Design Tokens (preview de cores e tipografia)
└── Component Summary (resumo de todos os componentes)
```

### Responsividade

- Grid responsivo para Cards (`sm:grid-cols-2`)
- Forms em grid (`md:grid-cols-2`)
- Flex wrap para badges e botões
- Component Summary em grid (`sm:grid-cols-2 lg:grid-cols-3`)

### Tema

- Dark/Light/System toggle no playground
- Todos os componentes consomem Design Tokens do Bloco 2
- Nenhuma paleta paralela — tudo via `index.css` @theme

### Arquitetura Final do Design System

```text
src/components/ui/
├── alert.tsx           (3C)
├── badge.tsx           (3A)
├── button.tsx          (3A)
├── card.tsx            (3C)
├── checkbox.tsx        (3B)
├── empty-state.tsx     (3D)
├── error-state.tsx     (3D)
├── icon-button.tsx     (3A)
├── index.ts            (barrel export)
├── input.tsx           (3B)
├── label.tsx           (3B)
├── loading-state.tsx   (3D)
├── select.tsx          (3B)
├── separator.tsx       (3C)
├── spinner.tsx         (3A/3D)
└── textarea.tsx        (3B)

Total: 15 arquivos
```

### Checklist Final — Fase 1.2 Completa

```text
[ x ] Button (primary, secondary, outline, ghost, danger)
[ x ] Button (sm, md, lg)
[ x ] Button (disabled, loading, focus-visible)
[ x ] Button (asChild polymorphism)
[ x ] IconButton (5 variants, 3 sizes)
[ x ] IconButton (aria-label obrigatório)
[ x ] Badge (default, primary, success, warning, danger, info)
[ x ] Badge (sm, md)
[ x ] Badge (dot indicator)

[ x ] Label (htmlFor, required)
[ x ] Input (native props, aria-invalid, error state)
[ x ] Textarea (native props, error state)
[ x ] Select (native HTML wrapper)
[ x ] Checkbox (native input, accent-primary)

[ x ] Card (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
[ x ] Separator (horizontal, vertical, role="separator")
[ x ] Alert (info, success, warning, danger, auto icons, role="alert")

[ x ] Spinner (sm, md, lg, currentColor)
[ x ] LoadingState (role="status", aria-live="polite")
[ x ] EmptyState (title, description, icon, action)
[ x ] ErrorState (title, description, icon, action, role="alert")

[ x ] Dark funcionando
[ x ] Light funcionando
[ x ] System funcionando

[ x ] Estados disabled
[ x ] Estados loading
[ x ] Estados error

[ x ] Acessibilidade básica
[ x ] Playground visual (/app/ui)
[ x ] Component Summary

[ x ] Tokens utilizados (sem paleta paralela)
[ x ] Lucide integrado
[ x ] CVA para variantes
[ x ] Radix Slot para asChild

[ x ] typecheck ✓
[ x ] lint ✓
[ x ] build ✓
```

### Dependências Adicionadas

```text
class-variance-authority   ^0.7.1   (gerenciamento de variantes)
@radix-ui/react-slot       ^1.2.3   (polimorfismo asChild)
```

### Nota sobre Chunk Size

Build warn: 505 KB bundle. Aceitável para dev — será endereçado com code splitting na Fase 2.

---

## 2026-08-25 — Fix: react(only-export-components) warnings

**Problema:** Lint emitia 4 warnings do `react(only-export-components)` porque `button.tsx`, `icon-button.tsx`, `badge.tsx` e `alert.tsx` exportavam constantes (`*Variants`) junto com componentes, quebrando o Fast Refresh.

**Solução:** Centralização de todas as definições CVA em um único arquivo `src/lib/variants.ts`.

**Arquivos modificados:**

```text
src/lib/variants.ts           (CRIADO — 4 definitions: buttonVariants, iconButtonVariants, badgeVariants, alertVariants)
src/components/ui/button.tsx  (MODIFICADO — importa de @/lib/variants, exporta apenas Button)
src/components/ui/icon-button.tsx (MODIFICADO — importa de @/lib/variants, exporta apenas IconButton)
src/components/ui/badge.tsx   (MODIFICADO — importa de @/lib/variants, exporta apenas Badge)
src/components/ui/alert.tsx   (MODIFICADO — importa de @/lib/variants, exporta Alert, AlertTitle, AlertDescription)
src/components/ui/index.ts    (MODIFICADO — re-exporta variante de @/lib/variants)
```

**Antes (4 warnings):**

```text
button.tsx:     export { Button, buttonVariants };
icon-button.tsx: export { IconButton, iconButtonVariants };
badge.tsx:      export { Badge, badgeVariants };
alert.tsx:      export { Alert, AlertTitle, AlertDescription, alertVariants };
```

**Depois (0 warnings):**

```text
src/lib/variants.ts:           export const buttonVariants = cva(...)
src/lib/variants.ts:           export const iconButtonVariants = cva(...)
src/lib/variants.ts:           export const badgeVariants = cva(...)
src/lib/variants.ts:           export const alertVariants = cva(...)
src/components/ui/index.ts:    export { buttonVariants, iconButtonVariants, badgeVariants, alertVariants } from "@/lib/variants"
```

**Validação:**

```text
npm run typecheck  → ✅ sucesso
npm run lint       → ✅ 0 warnings, 0 errors
npm run build      → ✅ sucesso
```

---

## 2026-08-25 — Fase 1.3: App Shell e Navegação (Bloco 4A)

**Fase:** 1 — Design System e Layout Base

**Descrição:** Implementação do esqueleto estrutural da aplicação com navegação centralizada, rotas aninhadas e Sidebar funcional.

**Arquivos criados:**

```text
src/config/navigation.ts                  (navegação centralizada)
src/components/layout/app-sidebar.tsx     (Sidebar com NavLink)
src/pages/dashboard-page.tsx              (placeholder)
src/pages/wallets-page.tsx                (placeholder)
src/pages/transactions-page.tsx           (placeholder)
src/pages/websites-page.tsx               (placeholder)
src/pages/goals-page.tsx                  (placeholder)
src/pages/portfolio-page.tsx              (placeholder)
```

**Arquivos modificados:**

```text
src/layouts/app-layout.tsx    (evoluiu de Outlet-only para Sidebar + main + Outlet)
src/app/router/index.tsx      (rotas aninhadas /app/* + redirect)
```

**Arquivos removidos:**

```text
src/pages/app-page.tsx        (substituída por dashboard-page.tsx)
```

### navigation.ts

Arquivo único de verdade para navegação principal:

```text
navigationItems[]
├── Dashboard    → /app/dashboard     → LayoutDashboard
├── Wallets      → /app/wallets       → WalletCards
├── Transactions → /app/transactions  → ArrowLeftRight
├── Websites     → /app/websites      → Globe
├── Goals        → /app/goals         → Target
└── Portfolio    → /app/portfolio     → ChartNoAxesCombined
```

Tipo exportado: `NavigationItem { label, to, icon }`

### AppSidebar

```text
<aside>                          (w-64, shrink-0, border-r)
  <nav>
    <div>APM SYN</div>           (logo area)
    <ul>
      {navigationItems.map}      (NavLink com isActive styling)
    </ul>
  </nav>
</aside>
```

- Consome `navigationItems` de `@/config/navigation`
- Usa `NavLink` do React Router (não Link)
- `isActive` detecta automaticamente a rota ativa
- Active: `bg-primary/10 text-primary`
- Inactive: `text-foreground-secondary hover:bg-surface hover:text-foreground`

### AppLayout

```text
┌───────────────┬─────────────────────────────┐
│               │                             │
│   Sidebar     │          Content            │
│   (w-64)      │    flex-1 min-w-0 p-8       │
│               │                             │
│               │          <Outlet />         │
│               │                             │
└───────────────┴─────────────────────────────┘
```

- `min-h-dvh` — altura mínima da viewport
- `aside` → `shrink-0` (não encolhe)
- `main` → `flex-1 min-w-0 overflow-auto` (preenche espaço restante)

### Router

```text
/
├── HomePage
│
├── /app
│   ├── index → Navigate to /app/dashboard (replace)
│   ├── /dashboard → DashboardPage
│   ├── /wallets → WalletsPage
│   ├── /transactions → TransactionsPage
│   ├── /websites → WebsitesPage
│   ├── /goals → GoalsPage
│   ├── /portfolio → PortfolioPage
│   └── /ui → UiPlaygroundPage
│
└── * → NotFoundPage (404)
```

### Checklist 4A

```text
[ x ] navigation.ts criado
[ x ] navegação centralizada (6 itens, Lucide icons, tipo NavigationItem)
[ x ] 6 páginas placeholder criadas
[ x ] AppSidebar criada (NavLink, isActive, aside/nav semântico)
[ x ] AppSidebar usa navigationItems
[ x ] NavLink utilizado (não Link)
[ x ] AppLayout possui Sidebar + main + Outlet
[ x ] /app redireciona para /app/dashboard (Navigate replace)
[ x ] todas as 6 rotas funcionam
[ x ] app-page.tsx removido
[ x ] 404 continua funcionando

[ x ] typecheck ✓
[ x ] lint ✓ (0 warnings, 0 errors)
[ x ] build ✓
```

---

## 2026-08-25 — Fase 1.3 Bloco 4B: Sidebar Desktop Completa

**Fase:** 1 — Design System e Layout Base

**Descrição:** Implementação completa da Sidebar desktop com expand/collapse, 3 seções, brand, navigation, footer com theme toggle e portfolio overview.

**Arquivos criados:**

```text
src/lib/theme.ts                                (setTheme/getTheme compartilhado)
src/pages/settings-page.tsx                     (placeholder)
src/components/layout/AppSidebar/sidebar-brand.tsx        (logo + collapse button)
src/components/layout/AppSidebar/sidebar-navigation.tsx   (sections + NavLinks)
src/components/layout/AppSidebar/sidebar-footer.tsx       (theme toggle + PWA + portfolio)
src/components/layout/AppSidebar/portfolio-overview.tsx   (card visual)
```

**Arquivos modificados:**

```text
src/config/navigation.ts                       (navigationItems → navigationSections)
src/components/layout/AppSidebar/app-sidebar.tsx  (rewritten with state + sub-components)
src/components/layout/app-layout.tsx           (h-dvh, overflow-hidden)
src/app/router/index.tsx                       (added /app/settings route)
```

### navigation.ts → navigationSections

```text
Main
├── Dashboard    → /app/dashboard     → LayoutDashboard
└── Portfolio    → /app/portfolio     → ChartNoAxesCombined

Manage
├── Websites     → /app/websites      → Globe
├── Wallets      → /app/wallets       → WalletCards
├── Transactions → /app/transactions  → ArrowLeftRight
└── Goals        → /app/goals         → Target

System
└── Settings     → /app/settings      → Settings
```

### Estrutura da Sidebar

```text
┌──────────────────────────────────────┐
│                                      │
│   ┌──── SidebarBrand ────────────┐   │
│   │  ◉ APM SYN                   │──◉│ ← Collapse button (saliente)
│   │    Asset Portfolio Manager    │   │
│   └──────────────────────────────┘   │
│                                      │
│══════════════════════════════════════│
│                                      │
│  MAIN                                │
│  ◉ Dashboard                         │
│  ◉ Portfolio                         │
│                                      │
│  MANAGE                              │
│  ◉ Websites                          │
│  ◉ Wallets                           │
│  ◉ Transactions                      │
│  ◉ Goals                             │
│                                      │
│  SYSTEM                              │
│  ◉ Settings                          │
│                                      │
│══════════════════════════════════════│
│                                      │
│  🌙/☀/⊙ Theme                        │
│  ↓ Install app (placeholder)         │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ◉ Portfolio: $12,450.00        │  │
│  │         +8.42%                 │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

### Comportamento Expandido/Recolhido

```text
Expandido:  w-64 (256px)
Recolhido:  w-[72px]
Transição:  200ms ease-in-out (transition-[width])
```

- **Desktop (≥1024px):** inicia expandido
- **Tablet (768-1023px):** inicia recolhido
- **Resize:** tablet → recolhido, desktop → expandido
- **Mobile (<768px):** Sidebar não aparece (app-layout esconde)

### SidebarBrand

- Ícone: `Workflow` do Lucide (representa sincronização)
- Wordmark: "APM SYN" (bold) + subtitle "Asset Portfolio Manager"
- Collapsed: apenas ícone
- **Botão collapse:** `position: absolute`, `right: -12px`, circular, `bg-primary`, `z-10`
  - Expandido: `PanelLeftClose`
  - Recolhido: `PanelLeftOpen`
  - `aria-label` + `title`

### SidebarNavigation

- Seções com títulos: MAIN, MANAGE, SYSTEM
- Collapsed: títulos escondidos, separadores visuais entre seções
- NavLink com `isActive` → `bg-white/14 text-white`
- Hover → `bg-white/8 text-white`
- Default → `text-white/70`
- `title` attribute no collapsed para tooltip nativo

### SidebarFooter

- **ThemeToggle:** ciclo Dark → Light → System, ícone muda (Moon/Sun/Monitor)
- **PWA Install:** placeholder desabilitado
- **PortfolioOverview:** card visual com valor + change

### PortfolioOverview

- Expandido: valor + percentual
- Recolhido: ícone WalletCards + TrendingUp/TrendingDown
- Dados: placeholder (não conectado à API)

### Sidebar Visual

- Background: `bg-primary` (constante em Dark/Light)
- Bordas entre seções: `border-white/10`
- Transparências: `white/8`, `white/14`, `white/40`, `white/50`, `white/70`
- Tokens: via CSS custom properties (--color-primary)

### Checklist 4B

```text
[ x ] navigationSections (3 grupos: Main, Manage, System)
[ x ] Settings adicionado
[ x ] SettingsPage criada
[ x ] Router atualizado (/app/settings)
[ x ] SidebarBrand com logo (Workflow icon)
[ x ] SidebarBrand collapse button (saliente, circular)
[ x ] SidebarNavigation com seções
[ x ] SidebarNavigation NavLink com isActive
[ x ] SidebarFooter com ThemeToggle (Dark/Light/System)
[ x ] SidebarFooter com PWA placeholder
[ x ] SidebarFooter com PortfolioOverview
[ x ] PortfolioOverview visual (expandido + recolhido)
[ x ] PortfolioOverview recolhido = wallet icon
[ x ] Estado expandido/recolhido (useState + media query)
[ x ] Desktop inicia expandido (≥1024px)
[ x ] Tablet inicia recolhido (768-1023px)
[ x ] Resize tratado (resize listener)
[ x ] Transição 200ms width
[ x ] Active state (bg-white/14)
[ x ] Hover state (bg-white/8)
[ x ] Focus-visible no botão collapse
[ x ] aria-labels
[ x ] Labels ocultos no collapsed
[ x ] Sidebar bg-primary (Dark/Light consistente)

[ x ] typecheck ✓
[ x ] lint ✓ (0 warnings, 0 errors)
[ x ] build ✓
```

---

**Fase 1.3 — App Shell e Navegação — EM ANDAMENTO**
