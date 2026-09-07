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
<Input {...register("name")} aria-invalid={!!errors.name} />;
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
if (isError)
  return (
    <ErrorState
      title="Error"
      action={<Button onClick={refetch}>Try again</Button>}
    />
  );
if (data.length === 0)
  return <EmptyState title="No data" action={<Button>Create</Button>} />;
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

## 2026-08-25 — Componentes de Layout: AppHeader, AppSidebar e AppFooter

**Fase:** 1 — Design System e Layout Base

**Descrição:** Implementação/evolução dos componentes estruturais de layout do App Shell: sidebar de ícones com tooltips e troca de tema, header fixo com navegação, dropdown de perfil/notificações, menu mobile e footer.

**Arquivos analisados:**

```text
frontend/src/components/layout/AppSidebar/app-sidebar.tsx
frontend/src/components/layout/Header/app-header.tsx
frontend/src/components/layout/Footer/app-footer.tsx
```

### AppSidebar

Sidebar compacta (rail de ícones, `w-16`) fixada à esquerda, com navegação agrupada via `navigationSections`:

```text
- aside fixo (fixed) abaixo do header (top-16), h-[calc(100vh-4rem)]
- Topo: ícones fixos (CalendarCheck, WalletMinimal) com Tooltip
- Centro: itens de navegação via allNavItems = navigationSections.flatMap(section => section.items)
- Link usa useLocation para detectar rota ativa (location.pathname === item.to)
- Estado ativo: text-foreground bg-foreground/5 + indicador (barra primary -right-2)
- Tooltips (TooltipProvider/Root/Trigger/Portal/Content) laterais (side="right")
- Bottomo: Theme Switcher (Sun/Moon) + Logout (LogOut)
- Theme switch: estado isDark em localStorage + classe dark/light no <html>
```

Principais pontos:

- **Theme toggle** — `isDark` inicializado de `localStorage.theme` ou `prefers-color-scheme`; `useEffect` aplica `dark`/`light` em `document.documentElement` e persiste no `localStorage`.
- **Ícones Sun/Moon** — overlay com cross-fade/rotação (`opacity` + `rotate` + `scale`) na troca de tema.
- **Tooltips** — cada ícone de navegação e ação expõe tooltip lateral com atalho (`⌘`) e label.

### AppHeader

Header fixo (`fixed top-0 z-50 h-16`) com fundo translúcido e backdrop-blur ao rolar (`useScroll(0)`):

```text
- Left: HeaderLogo
- Mobile: bloco de Total Balance ($15.000,00) + botão Menu (IconButton) que abre overlay
- Desktop (md+): HeaderNav (Overview, Portfolio, Websites, Wallets, Transactions) +
  Backup (CloudDownload) + NotificationDropdown + separador + ProfileDropdown
- Scrolled: bg-surface/80 backdrop-blur-md border-b shadow-sm
```

Principais pontos:

- **Menu mobile** — overlay full-screen com animação de entrada (`translate-x-full` → `translate-x-0`) via `requestAnimationFrame` + `mounted`/`shouldAnimateIn`; `useEffect` fecha ao mudar de rota (`location.pathname`).
- **HeaderNav** — extrai itens específicos de `navigationSections` para exibir no header desktop.
- **Dropdowns** — `NotificationDropdown` e `ProfileDropdown` compostos em componentes próprios.

### AppFooter

Footer simples com créditos e links:

```text
- Ano dinâmico (new Date().getFullYear())
- Texto "Made with <Heart> by Kubo Labs"
- Links: About (/about), Terms (/terms), Support (/support) via <a>
- Layout responsivo (coluna no mobile, linha no md+)
```

---

## 2026-08-30 — Fase 5A: Frontend conversando com Backend (Wallets)

**Fase:** 5 — Wallets (fundação)

**Descrição:** Criação da estrutura da feature Wallets e da camada de dados, sem UI da lista (cards, tabela, modal, formulário visual, holdings, skeletons, toasts — tudo isso fica para depois). O frontend passa a saber conversar com o backend de Wallets de forma tipada e com separação de camadas.

**Arquivos criados:**

```text
frontend/src/features/wallets/
├── api/
│   ├── wallet-api.ts            (camada HTTP pura)
│   └── wallet-queries.ts        (TanStack Query + query keys + invalidação)
├── types/
│   └── wallet.types.ts          (tipos do dominio)
└── schemas/
    └── wallet.schema.ts         (schemas Zod — validacao UX)
```

**Arquivos removidos (stubs vazios obsoletos, 0 bytes e sem importacoes):**

```text
frontend/src/api/wallet-api.ts        (estava vazio)
frontend/src/api/wallet-queries.ts    (estava vazio; diretório src/api removido)
frontend/src/schemas/wallet.schema.ts (estava vazio)
```

Esses stubs viviam em localizacoes alternativas (`src/api/`, `src/schemas/`) e foram substituidos pela estrutura `src/features/wallets/...` conforme definido em `ToDo.md`.

---

### 1. `types/wallet.types.ts`

Tipos do dominio Wallet, refletindo o contrato HTTP **real** do backend (arquivo `backend/src/services/wallet.service.ts`, funcao `toWalletResponse`), nao uma versao inventada:

```text
WalletStatus = "active" | "inactive" | "archived"
WalletType   = "exchange" | "crypto" | "microwallet" | "hardware" | "banking" | "other"

Wallet {
  id: string           // backend expoe String(_id) -> frontend nao conhece _id
  userId: string
  name: string
  type: WalletType
  status: WalletStatus
  color?: string
  description?: string
  createdAt: string     // ISO
  updatedAt: string     // ISO
}

CreateWalletInput  { name, type, color?, description? }
UpdateWalletInput  { name?, type?, color?, description? }   // todos opcionais (PATCH parcial)
WalletListParams   { page?, limit?, sort?, status?, type? }
```

Conforme a decisao arquitetural: **MongoDB usa `_id`, mas o contrato HTTP expoe `id`** (o service faz `id: String(_id)` e descarta `__v`). O frontend só conhece `id`.

Observacao sobre `balances`: o `GET /wallets/:id` **pode** incluir `balances` (dado derivado). Foi intencionalmente **omitido** do tipo `Wallet` base neste momento, pois holdings/operacoes financeiras sao Fase 6+. Todas as rotas da 5A (create/list/update/activate/deactivate/archive/delete) retornam apenas os campos base via `toWalletResponse`.

### 2. `schemas/wallet.schema.ts`

Schemas Zod para validacao de entrada (UX). O backend continua sendo a autoridade; o frontend valida apenas o que melhora a experiencia:

```text
createWalletSchema   -> CreateWalletFormData   (name: trim, min 1, max 80; type: enum; color?, description?)
updateWalletSchema   -> UpdateWalletFormData   (campos opcionais + refine "pelo menos um campo")
walletListQuerySchema-> WalletListQuery         (page/limit coerce number + defaults; status/type enum)
```

Fluxo futuro: React Hook Form → Zod → `CreateWalletInput` → `wallet-api`.

### 3. `api/wallet-api.ts`

Camada HTTP **pura**. Nao contem React, useQuery, useMutation, componentes ou estado visual. Recebe o token do chamador e delega ao `apiClient` centralizado.

```text
getWallets(token, params?)       GET  /wallets[?...])            -> PaginatedResponse<Wallet>
getWallet(token, id)             GET  /wallets/:id                 -> Wallet
createWallet(token, body)        POST /wallets                     -> Wallet
updateWallet(token, id, body)    PATCH /wallets/:id                -> Wallet
archiveWallet(token, id)         POST /wallets/:id/archive         -> Wallet
activateWallet(token, id)        POST /wallets/:id/activate        -> Wallet
deactivateWallet(token, id)       POST /wallets/:id/deactivate        -> Wallet
deleteWallet(token, id)          DELETE /wallets/:id               -> void (204)
```

Decisao de contrato (validada contra o backend):

- Recursos individuais vêm envoltos em `{ data: Wallet }` → a camada `wallet-api` **desempacota** `data` e devolve o dominio `Wallet` diretamente.
- A listagem vem como `{ data: Wallet[], pagination: { page, limit, total, totalPages } }` → retornado direto como `PaginatedResponse<Wallet>` (sem desempacotar `data`).
- DELETE retorna `204 No Content` → `apiClient` devolve `undefined` e a funcao resolve `void`.

### 4. `api/wallet-queries.ts`

TanStack Query + query keys padronizadas + invalidacao. Usa Clerk `useAuth().getToken()` para obter o session token e o repassa a `wallet-api`.

```text
walletKeys = {
  all:    ["wallets"],                              // prefixo para invalidacao em massa
  list:   (params?) => ["wallets", "list", params],  // lista (com params para paginacao/filtro)
  detail: (id)       => ["wallets", "detail", id],   // detalhe de uma wallet
}

useWalletsQuery(params?)          -> GET  lista
useWalletQuery(walletId)          -> GET  detalhe (enabled: !!walletId)
useCreateWalletMutation()         -> POST  -> invalida ["wallets"]
useUpdateWalletMutation()         -> PATCH -> invalida ["wallets","detail",id] + ["wallets"]
useArchiveWalletMutation()        -> POST  -> invalida ["wallets","detail",id] + ["wallets"]
useActivateWalletMutation()       -> POST  -> invalida ["wallets","detail",id] + ["wallets"]
useDeactivateWalletMutation()     -> POST  -> invalida ["wallets","detail",id] + ["wallets"]
useDeleteWalletMutation()         -> DELETE-> invalida ["wallets"]
```

Fonteira de responsabilidade (conforme ToDo):

```text
UI / componentes
  ↓ nao conhecem URLs, headers, fetch ou auth HTTP
Hooks (useAuth -> getToken)
  ↓
TanStack Query  (wallet-queries)
  ↓
wallet-api      (HTTP puro -> apiClient)
  ↓
apiClient       (Authorization: Bearer token)
  ↓
Backend APM SYN  (GET/POST/PATCH/DELETE /api/v1/wallets[...])
```

### Divergencia encontrada / Decisao importante (reportada, nao "consertada" no backend)

`frontend/.env` define `VITE_API_URL=http://localhost:3000/api/v1` — **inclui o prefixo `/api/v1`**. Como `apiClient` monta `${env.apiUrl}${path}`, os paths da `wallet-api` foram definidos **sem** o prefixo (`/wallets`, `/wallets/:id`, ...), resultando na URL final correta `http://localhost:3000/api/v1/wallets`.

Se os paths incluissem `/api/v1/wallets`, a URL ficaria `http://localhost:3000/api/v1/api/v1/wallets` (duplicado) — roteamento 404. A regra estabelecida: **paths da wallet-api sao relativos a `env.apiUrl`; como `env.apiUrl` ja carrega `/api/v1`, nao se repete o prefixo.** Nenhuma modificacao foi feita no backend para isso (tratado no cliente, onde era devido).

### Observacoes de arquitetura respeitadas

- Separacao `wallet-api` (HTTP) x `wallet-queries` (TanStack/React) x componentes (UI).
- Nenhuma lógica HTTP espalhada pela UI.
- Tipos refletem o contrato real do backend, incluindo `userId` retornado por `toWalletResponse`.
- Schemas frontend alinhados aos limites do backend (UX validation), sem duplicar regras de negocio/confianca.

### O que NÃO foi feito (reservado para as proximas etapas)

```text
- UI da lista (tabela/cards)
- modal / formulario visual
- pagina de detalhes
- holdings / balances derivados (Fase 6)
- operacoes financeiras (deposits/withdrawals/adjustments — Fase 6)
- skeletons/toasts especificos de Wallet
```

### Validação

```text
npm run typecheck  → ✅ sucesso (0 erros)
npm run lint       → ✅ 0 warnings / 0 errors em arquivos novos
                     (2 warnings pre-existentes em src/components/layout/Header/app-header.tsx — fora de escopo)
npm run build      → ✅ sucesso (tsc -b && vite build)
```

### Checklist Fase 5A

```text
[ x ] Estrutura da feature criada (features/wallets/{api,types,schemas})
[ x ] Tipos Wallet definidos
[ x ] WalletStatus definido
[ x ] WalletType definido
[ x ] Inputs definidos (CreateWalletInput, UpdateWalletInput, WalletListParams)
[ x ] Schemas Zod definidos (create/update/list-query)
[ x ] wallet-api criado
[ x ] CRUD conectado ao apiClient (getWallets, getWallet, createWallet, updateWallet, deleteWallet)
[ x ] Status transitions conectados (archive/activate/deactivate)
[ x ] Queries TanStack Query criadas
[ x ] Mutations criadas
[ x ] Query keys padronizadas (["wallets"], ["wallets","list",params], ["wallets","detail",id])
[ x ] Invalidação configurada (all como prefixo; detail(id) para mutations)
[ x ] Sem lógica HTTP espalhada pela UI
[ x ] typecheck ✓  lint ✓  build ✓
```

---

## 2026-08-30 — Fase 5B-Step1: Summary Wallets (PageHeader + Summary + GET /transactions)

**Fase:** 5 — Wallets (UI por Sections)

**Descrição:** Implementação do primeiro bloco da Wallets page — `Summary` dentro da section superior (mesmo container do `PageHeader` e `Analysis` + `All Wallets List`). O `Summary` exibe 4 cards (Total Balance, Total Inflows, Total Outflows, Total Transactions) com dados reais vindos da API via `GET /transactions`, sem saldo inventado, com LoadingState cobrindo todo o bloco e tratamento de erro com retry. Componente importado em `wallets-page.tsx` substituindo o placeholder.

**Arquivos criados:**

```text
frontend/src/features/transactions/types/transaction.types.ts   (tipos do domínio Transaction)
frontend/src/features/transactions/api/transaction-api.ts       (camada HTTP pura)
frontend/src/features/transactions/api/transaction-queries.ts   (TanStack Query + query keys)
```

**Arquivos modificados:**

```text
frontend/src/pages/Wallets/summary-wallets.tsx   (implementado — 4 cards + integração real)
frontend/src/pages/wallets-page.tsx              (import SummaryWallets, substitui placeholder)
```

---

### 1. `features/transactions/types/transaction.types.ts`

Tipos espelhando o contrato real do backend (`backend/src/services/transaction.service.ts:16` `toResponse`, `backend/src/models/transaction.model.ts:3`):

```text
TransactionType = "WALLET_DEPOSIT" | "WALLET_WITHDRAWAL" | "WALLET_TRANSFER" | "WALLET_ADJUSTMENT" | "WEBSITE_EARNING" | "WEBSITE_WITHDRAWAL"
ParticipantType = "WALLET" | "WEBSITE" | "EXTERNAL"

Transaction {
  id: string
  userId: string
  type: TransactionType
  source: { type: ParticipantType; id?: string }
  destination: { type: ParticipantType; id?: string }
  asset: { externalId, symbol, name }
  quantity: number
  usdValue: number
  countsTowardGoal: boolean
  date: string           // ISO
  description?: string
  createdAt: string
  updatedAt: string
}

TransactionListParams { page?, limit?, sort?, type?, walletId?, websiteId?, asset?, from?, to?, countsTowardGoal? }
```

Decisão: frontend conhece apenas `id` (String(_id)), nunca `_id`. `usdValue` é fonte para valores em USD.

### 2. `features/transactions/api/transaction-api.ts`

Camada HTTP pura, sem React. Recebe `token` do chamador e delega ao `apiClient`.

```text
getTransactions(token, params?)  GET /transactions[?...]  -> PaginatedResponse<Transaction>
getTransaction(token, id)        GET /transactions/:id      -> Transaction
```

Query builder suporta `page, limit, sort, type, walletId, websiteId, asset, from, to, countsTowardGoal`. Paths relativos a `env.apiUrl` (que já contém `/api/v1`), igual a `wallet-api.ts:25`.

### 3. `features/transactions/api/transaction-queries.ts`

TanStack Query + chaves padronizadas:

```text
transactionKeys = {
  all: ["transactions"],
  list: (params?) => ["transactions","list",params],
  detail: (id) => ["transactions","detail",id],
}

useTransactionsQuery(params?)  -> GET lista (queryKey list)
useTransactionQuery(id)        -> GET detalhe (enabled: !!id)
```

`getAuthToken()` via `useAuth().getToken()` — lança se sem sessão (capturado por `isError`). Nenhum `fetch` espalhado na UI.

### 4. `pages/Wallets/summary-wallets.tsx`

Componente `SummaryWallets` — presentational + data via hooks (sem HTTP direto):

```text
- useWalletsQuery({ limit: 100 })           -> walletCount = pagination.total
- useTransactionsQuery({ limit: 100, sort: "-date" }) -> transactions + pagination.total
```

Cálculos (sem saldo inventado):

```text
totalInflows  = sum(tx.usdValue) onde destination.type === "WALLET"
totalOutflows = sum(tx.usdValue) onde source.type === "WALLET"
balance       = totalInflows - totalOutflows
totalTransactions = pagination.total (ou data.length fallback)

This week (weekStartsOn: 1, segunda):
  weekStart = startOfWeek(now, {weekStartsOn:1})
  weekly = transactions filtradas por isWithinInterval(parseISO(tx.date), {start: weekStart, end: now})
  weeklyInflows / weeklyOutflows / weeklyCount idem
```

Formatação USD: `Intl.NumberFormat("en-US", {style:"currency", currency:"USD"})` → `$0.00`.

UI dos cards (4):

```text
grid grid-cols-2 gap-3
  Card {
    cima:  ícone (h-8 w-8 rounded-lg bg-surface-elevated border) + label (text-xs text-foreground-muted) + value (text-xl font-semibold tabular-nums)
    baixo: border-t border-border-subtle + secondaryText (text-xs text-foreground-secondary)
  }

1. Total Balance     → Wallet        → value: formatUSD(balance)           → secondary: "Across N wallets"
2. Total Inflows     → TrendingUp    → value: formatUSD(totalInflows)      → secondary: "$X\nThis week"
3. Total Outflows    → TrendingDown  → value: formatUSD(totalOutflows)     → secondary: "$X\nThis week"
4. Total Transactions→ Receipt       → value: String(totalTransactions)     → secondary: "N this week"
```

Tokens: `border-border`, `bg-surface`, `bg-surface-elevated`, `text-foreground*` — suporta dark/light/system (`index.css:42`). Ícones `lucide-react`. `tabular-nums` para números.

Estados:

```text
isLoading (wallets || transactions) → <div rounded-xl border bg-surface><LoadingState>Loading summary...</LoadingState></div>
isError   (wallets || transactions) → <ErrorState title="Unable to load summary" action={<Button onClick={refetch}>Try again</Button>} />
```

Limitação documentada: `paginate` backend limita a `100` (`backend/src/shared/utils/pagination.ts:21`). Agregações all-time usam apenas primeira página (100 recentes). Para >100 txs, totais ficam truncados — requer endpoint de agregação backend futuro. Já `totalTransactions` usa `pagination.total` (correto) e dados semanais vêm da primeira página (suficiente pois semana está nos recentes).

### 5. `pages/wallets-page.tsx:1-39`

```text
- import { SummaryWallets } from "./Wallets/summary-wallets"
- substitui placeholder <div> Summary </div> por <SummaryWallets />
- mantém grid grid-cols-2 gap-4 (Summary + Analysis) dentro de flex-1 p-4
- All Wallets List continua w-120 ao lado
```

Sem lógica HTTP na UI — `wallets-page.tsx` apenas compõe; dados vêm dos hooks dentro de `SummaryWallets`.

### Validação

```text
npm run typecheck → ✅ sucesso
npm run lint      → ✅ 0 errors, 2 warnings pre-existentes em app-header.tsx (fora de escopo)
npm run build     → ✅ sucesso (643 kB, tsc -b && vite build)
```

### Checklist Fase 5B-Step1

```text
[ x ] /app/wallets não é mais placeholder puro (Summary real)
[ x ] SummaryWallets implementado com 4 cards
[ x ] Total Balance (Across N wallets, $ USD)
[ x ] Total Inflows ($ total + $ This week)
[ x ] Total Outflows ($ total + $ This week)
[ x ] Total Transactions (count + N this week)
[ x ] Wallets reais carregadas via useWalletsQuery
[ x ] Transactions reais via GET /transactions (useTransactionsQuery)
[ x ] LoadingState cobrindo Summary todo
[ x ] ErrorState com Retry (refetch ambas queries)
[ x ] Sem saldo financeiro inventado (cálculo via usdValue real)
[ x ] Sem lógica HTTP na UI (apiClient apenas em transaction-api)
[ x ] Formatação $ 0.00 USD (Intl.NumberFormat en-US)
[ x ] Ícones definidos (Wallet, TrendingUp, TrendingDown, Receipt)
[ x ] Dark mode ✓ (tokens bg-surface/border)
[ x ] Light mode ✓
[ x ] Responsive (grid-cols-2 interno, grid-cols-2 pai)
[ x ] typecheck ✓  lint ✓  build ✓
```

Próximos passos (fora deste step): Analysis (Wallets by participation), All Wallets List lateral, Cards com filtros/sort, All Activities com paginação.

---

## 2026-08-30 — Fase 2.1: Autenticação Frontend com Clerk (@clerk/clerk-react v5.61.9)

**Fase:** 2 — Autenticação e Proteção de Rotas

**Descrição:** Implementação da etapa de autenticação do frontend utilizando o SDK Clerk já instalado (`@clerk/clerk-react@5.61.9`). Criadas páginas nativas de sign-in e sign-up, proteção de rotas `/app/*` para usuários não autenticados e redirecionamento de usuários autenticados para `/app/overview`. Removidos mocks do `ProfileDropdown` e `AppSidebar`, substituídos por dados e ações reais do Clerk.

**Arquivos criados:**

```text
frontend/src/pages/sign-in-page.tsx
frontend/src/pages/sign-up-page.tsx
frontend/src/components/auth/protected-route.tsx
frontend/src/components/auth/public-route.tsx
```

**Arquivos modificados:**

```text
frontend/src/app/router/index.tsx
frontend/src/components/layout/Header/profile-dropdown.tsx
frontend/src/components/layout/AppSidebar/app-sidebar.tsx
```

### Versão do Clerk instalada

```text
@clerk/clerk-react: 5.61.9
```

Componentes e hooks utilizados (API compatível com v5):

```text
- <SignIn />            página completa de autenticação (embarcada)
- <SignUp />            página completa de cadastro (embarcada)
- useAuth()             { isLoaded, isSignedIn, userId, sessionId, getToken }
- useUser()             dados do usuário autenticado
- useClerk()            instância do clerk para signOut()
```

### 1. Páginas de Autenticação

**`sign-in-page.tsx`** — wrapper mínimo em torno do componente `<SignIn />` do Clerk:

```tsx
import { SignIn } from "@clerk/clerk-react";

export function SignInPage() {
  return <SignIn />;
}
```

**`sign-up-page.tsx`** — wrapper mínimo em torno do componente `<SignUp />` do Clerk:

```tsx
import { SignUp } from "@clerk/clerk-react";

export function SignUpPage() {
  return <SignUp />;
}
```

Ambas as páginas são servidas em `/sign-in` e `/sign-up` respectivamente, usando a UI gerenciada pelo Clerk (sem formulários customizados).

### 2. Route Guards

**`ProtectedRoute`** — protege rotas que exigem autenticação:

```tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <LoadingState>Loading...</LoadingState>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}
```

**`PublicRoute`** — redireciona usuários já autenticados para `/app/overview`:

```tsx
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <LoadingState>Loading...</LoadingState>;
  }

  if (isSignedIn) {
    return <Navigate to="/app/overview" replace />;
  }

  return children;
}
```

### 3. Router

Rotas atualizadas em `src/app/router/index.tsx`:

```text
/          → PublicRoute > HomePage
/sign-in   → PublicRoute > SignInPage
/sign-up   → PublicRoute > SignUpPage
/app       → ProtectedRoute > AppLayout
  ├── /app/overview
  ├── /app/wallets
  ├── /app/activities
  ├── /app/websites
  ├── /app/goals
  ├── /app/portfolio
  ├── /app/settings
  └── /app/ui
*          → NotFoundPage (404)
```

### 4. ProfileDropdown (remoção de mock)

`ProfileDropdown` atualizado para consumir dados reais do Clerk via `useUser()`:

```tsx
const { user } = useUser();

const userName = user?.fullName || user?.firstName || "User";
const userEmail = user?.primaryEmailAddress?.emailAddress || "";
const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";
```

O item "Logout" agora executa `clerk.signOut()` via `useClerk()` ao invés de um link morto (`href: "#logout"`).

### 5. AppSidebar (remoção de mock)

Botão de logout na sidebar conectado ao Clerk:

```tsx
const clerk = useClerk();

<button onClick={() => clerk.signOut()}>
  <LogOut />
</button>
```

### Decisões Arquiteturais

- **Não criada autenticação própria** — utilizada exclusivamente a API do `@clerk/clerk-react`.
- **Sem mocks** — `ProfileDropdown` e `AppSidebar` agora usam dados/actions reais.
- **ClerkProvider não alterado** — mantida a configuração existente (`publishableKey={env.clerkPublishableKey}`).
- **Redirecionamento centralizado** — `PublicRoute` e `ProtectedRoute` garantem fluxo correto sem lógica espalhada.
- **Loading states** — `LoadingState` do Design System exibido enquanto `isLoaded` é false.

### Fluxo de autenticação

```text
Usuário acessa /app/*
    ↓
ProtectedRoute (useAuth)
    ↓
isLoaded = false → LoadingState
    ↓
isLoaded = true, isSignedIn = false → Navigate /sign-in
    ↓
isLoaded = true, isSignedIn = true → renderiza AppLayout
```

```text
Usuário acessa /sign-in (já autenticado)
    ↓
PublicRoute (useAuth)
    ↓
isLoaded = false → LoadingState
    ↓
isLoaded = true, isSignedIn = true → Navigate /app/overview
    ↓
isLoaded = true, isSignedIn = false → renderiza SignInPage
```

### Validação

```text
npm run typecheck  → ✅ sucesso
npm run lint       → ✅ 0 warnings, 0 errors
npm run build      → ✅ sucesso
```

### Checklist Fase 2.1

```text
[ x ] @clerk/clerk-react v5.61.9 inspecionado
[ x ] ClerkProvider preservado sem alterações
[ x ] /sign-in criada (SignIn embarcado do Clerk)
[ x ] /sign-up criada (SignUp embarcado do Clerk)
[ x ] /app/* protegida para não autenticados
[ x ] Redirecionamento de autenticados para /app/overview
[ x ] PublicRoute implementado
[ x ] ProtectedRoute implementado
[ x ] ProfileDropdown sem mocks (useUser + useClerk)
[ x ] AppSidebar logout conectado (useClerk.signOut)
[ x ] Arquitetura existente preservada
[ x ] Nenhuma autenticação própria criada
[ x ] typecheck ✓
[ x ] lint ✓
[ x ] build ✓
```

---

## 2026-08-30 — Fase 5B-Step2: Analytics by Participation (Rosca + Recharts)

**Fase:** 5 — Wallets (UI por Sections)

**Descrição:** Implementação da section `Analytics` dentro da parte superior da Wallets page (mesmo container de `PageHeader` + `Summary`). O foco é `Analysis by participation`: gráfico de rosca (Recharts) com participação do saldo total de cada wallet, centro com ícone + label + valor total, tooltip por fatia (nome + saldo) e legenda em 3 colunas (dot cor + nome). Header com título dinâmico por variante, botão de três pontinhos (`Ellipsis`) que abre dropdown para outras análises (`by inflows`, `by outflows`, `by transactions`), cada uma com UI própria distinta (não rosca).

**Dependências:**

```text
recharts@3.1.2 (+ es-toolkit, react-is) — gráfico rosca
```

Instalação via `npm install recharts@3.1.2 es-toolkit react-is --legacy-peer-deps` (React 19 requer legacy peer deps para recharts 3.x).

**Arquivos criados/modificados:**

```text
frontend/package.json                          (added recharts, es-toolkit, react-is)
frontend/src/pages/Wallets/analysis-wallets.tsx (implementado — rosca + variantes)
frontend/src/pages/wallets-page.tsx            (import AnalysisWallets, substitui placeholder)
```

---

### 1. `pages/Wallets/analysis-wallets.tsx`

**Estrutura 3 partes exigidas:**

```text
cima:   header — AnalysisHeader (título + Ellipsis dropdown + descrição)
meio:   gráfico — ParticipationChart (Recharts) ou listas específicas por variante
baixo:  legenda — grid adaptativo (3 colunas, 2 se <3 wallets)
```

**Header (`AnalysisHeader`):**

* `VARIANT_LABEL` e `VARIANT_DESC` por `Variant = "participation" | "inflows" | "outflows" | "transactions"`
* `participation: "Analysis by participation" / "Distribution of total balance across your wallets."`
* `inflows: "Analysis by inflows" / "Total inflows per wallet in the last 6 days (including today)."`
* `outflows: "Analysis by outflows" / "Total outflows per wallet in the last 6 days (including today)."`
* `transactions: "Analysis by transactions" / "Wallets ranked by transaction count (most to least)."`
* Layout: `flex justify-between` + `Button ghost Ellipsis` + dropdown absoluto `w-52 border bg-surface shadow-md` com `useRef` + `mousedown` outside + `Escape` para fechar. Seleção atual com `text-primary bg-primary/5`.

**Cálculo participação (sem saldo inventado):**

```text
wallets = useWalletsQuery({limit:100}).data
transactions = useTransactionsQuery({limit:100, sort:"-date"}).data
balances = Map<walletId,0>
for tx in transactions:
  if dest.type==="WALLET" && dest.id in map) balances[dest]+=usdValue
  if src.type==="WALLET" && src.id in map) balances[src]-=usdValue
totalBalance = sum(v>0) || fallback sum(all inflows - outflows) se todos <=0
chartData = wallets.map((w,i)=>{value: max(0,balance), color: normalizeColor(w.color,i)}).filter(v>0).sort(desc)
```

* `normalizeColor(color,i)`: se `color` é hex válido (`/^#([0-9A-Fa-f]{3}){1,2}$/`) normaliza `toLowerCase().trim()`, senão fallback `FALLBACK_COLORS[i%10]` (`#3b82f6, #22c55e, #f59e0b, #ef4444, #8b5cf6, #06b6d4, #ec4899, #6366f1, #14b8a6, #f97316`).
* `wallets`/`transactions` memoizados via `useMemo(() => data ?? [], [data])` para evitar re-render nos `useMemo` seguintes (lint exhaustive-deps corrigido).
* Limitação: backend `paginate` limita a 100 (`backend/src/shared/utils/pagination.ts:21`), participação truncada acima de 100 txs — documentado igual ao Summary.

**Gráfico rosca (`ParticipationChart`):**

* `ResponsiveContainer 100% x 220-240px` + `PieChart` + `Pie dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={1} cornerRadius={4} stroke="var(--color-surface)"`
* `Cell fill={color}` por wallet.
* `Tooltip content={<CustomTooltip>}` custom: `div border bg-surface px-3 py-2 shadow-md` com nome + `formatUSD(value)`; usa `formatUSD` com `Intl.NumberFormat("en-US",{currency:"USD"})`.
* Centro overlay absoluto `pointer-events-none flex flex-col items-center`: ícone `Wallet h-3.5` em `rounded-full bg-surface-elevated border`, label `Total Balance` (`text-[10px] text-foreground-muted`), valor `formatUSD(totalBalance)` (`text-sm font-semibold tabular-nums`).
* Hover: fatia exibe tooltip com nome + saldo total na wallet.

**Legenda:**

* `ul grid gap-2` com classe `grid-cols-3` quando `data.length>=3` senão `grid-cols-2` (adapta conforme resposta: `subDays(now,6)` e normalizar cores).
* Item: `dot h-2.5 w-2.5 rounded-full style={{background: color}}` + `span truncate text-xs text-foreground-secondary` com `wallet.name`.

**Outras variantes (UI distinta, não rosca):**

* `inflows` — `InflowsOutflowsList type="inflows"`: para cada wallet `value = sum destination=WALLET nos últimos 6 dias (subDays(now,6) até now)`, filtra `isWithinInterval(parseISO(tx.date), {start: subDays(now,6), end: now})`, ordena desc, exibe `row: dot+name vs $value` + barra `h-1.5 bg-border-subtle > div width% = value/max`.
* `outflows` — idem mas `source=WALLET`.
* `transactions` — `TransactionsRankList`: conta `tx onde source.id ou destination.id === wallet.id`, filtra `count>0`, ordena `desc`, exibe mini-tabela `grid [rank|wallet|Tx]` com header `bg-surface-elevated` e `rank` 1..n. Maiores em cima, menores embaixo.

**Estados:**

* `isLoading` (wallets || transactions) → `LoadingState "Loading analysis..."` dentro de `rounded-xl border bg-surface p-4`.
* `isError` → `ErrorState "Unable to load analysis" + Button Try again` com `refetch` ambas queries.
* `EmptyState` quando `participationData.length===0` ou `totalBalance<=0` / listas vazias.

**Tokens & Responsivo:** `border-border`, `bg-surface`, `text-foreground*`, `tabular-nums`; `ResponsiveContainer` garante tablet/desktop; `flex-col lg:flex-row` já em `wallets-page.tsx:10`.

### 2. `pages/wallets-page.tsx:1-42`

```text
- import { AnalysisWallets } from "./Wallets/analysis-wallets"
- mantém grid grid-cols-1 md:grid-cols-2 gap-4 (Summary + Analytics) sem restilizar
- substitui placeholder <div Wallets by participation ...> por <AnalysisWallets />
```

Estilo focado apenas no slot exigido; `PageHeader` e `All Wallets List` intactos.

### Validação

```text
npm run typecheck → ✅ sucesso (corrigido CustomTooltip typing e memo deps)
npm run lint      → ✅ 0 errors, 2 warnings pre-existentes em app-header.tsx (fora de escopo)
npm run build     → ✅ sucesso (920 kB, inclui recharts; tsc -b && vite build)
```

Correções necessárias: `react-is` instalado para recharts 3.x, `es-toolkit` deduped, `CustomTooltip` tipado como `{active?:boolean; payload?:Array<{payload:ChartEntry;value:number}>}`.

### Checklist Fase 5B-Step2

```text
[ x ] Analytics section implementada em analysis-wallets.tsx (não em wallets-page.tsx)
[ x ] Header: Analysis by participation (esquerda) + Ellipsis (direita) + dropdown 4 itens
[ x ] Descrição por variante abaixo do header
[ x ] Gráfico rosca (Recharts Pie inner 62% outer 88%, paddingAngle 1)
[ x ] Centro rosca: ícone Wallet + label Total Balance + $ totalBalance USD
[ x ] Tooltip fatia: nome wallet + saldo formatUSD
[ x ] Cores normalizadas (wallet.color ou fallback palette)
[ x ] Legenda 3 colunas (dot cor + nome); adapta grid-cols-2 se <3
[ x ] by inflows: lista barras últimos 6 dias (subDays(now,6))
[ x ] by outflows: lista barras últimos 6 dias
[ x ] by transactions: mini-tabela rank ordenada desc
[ x ] Cada variante UI distinta (não repete rosca)
[ x ] LoadingState cobrindo Analytics todo
[ x ] ErrorState com Retry
[ x ] EmptyState quando sem dados
[ x ] GET /wallets + GET /transactions reais (sem mock)
[ x ] Sem saldo inventado (usdValue real por wallet)
[ x ] Dark/Light via tokens
[ x ] Responsive (ResponsiveContainer, grid-cols-1 md:grid-cols-2 pai)
[ x ] Sem estilização desnecessária em wallets-page.tsx
[ x ] recharts instalado (3.1.2 + es-toolkit + react-is)
[ x ] typecheck ✓  lint ✓  build ✓
```

Próximos passos: All Wallets List lateral, Cards com filtros/sort, All Activities com paginação.
```

---

## 2026-08-30 — Fase 5B-Step3: Wallets List (Mini-tabela lateral)

**Fase:** 5 — Wallets (UI por Sections)

**Descrição:** Implementação da coluna lateral direita `Wallets` (mini-tabela sem header) na parte superior da página, ao lado de `Summary` + `Analysis`. Exibe 4 colunas por wallet: ícone, nome+tipo, saldo+assets, participação (barra + %). Wallets ordenadas por maior saldo decrescente. Topo com título e 4 botões icon-only com tooltip (depósito, retirada, transferência, ajuste) — global placeholder.

**Arquivos criados/modificados:**

```text
frontend/src/pages/Wallets/list-wallets.tsx   (implementado — 4 colunas + participações)
frontend/src/pages/wallets-page.tsx           (import ListWallets, substitui placeholder)
```

---

### 1. `pages/Wallets/list-wallets.tsx`

**Header da section:**

* Layout `flex justify-between gap-2` — esquerda `h2 text-sm font-semibold "Wallets"`, direita `flex gap-1` com 4 `IconButton ghost sm` envolvidos em `SimpleTooltip side="top"`:
  * `ArrowDownToLine` — Deposit
  * `ArrowUpFromLine` — Withdraw
  * `ArrowLeftRight` — Transfer
  * `SlidersHorizontal` — Adjust
* `aria-label` obrigatório, `onClick` placeholder `console.log("... clicked")` — global (não por wallet) conforme resposta.

**Cálculo (sem saldo inventado, saldo negativo = erro):**

```text
wallets = useWalletsQuery({limit:100}).data (memoizado)
transactions = useTransactionsQuery({limit:100, sort:"-date"}).data (memoizado)
balances: Map<walletId,0>
for tx in transactions:
  if dest.type==="WALLET" && dest.id in map) balances[dest]+=usdValue
  if src.type==="WALLET" && src.id in map) balances[src]-=usdValue
hasNegative = any balance < 0  → se verdadeiro → ErrorState "Negative balance detected"
totalBalance = Σ balance>0 (fallback Σ inflows-outflows se todos <=0, igual Summary/Analysis)
rows: wallets.map((w,i)=>({
  balance: balances.get(w.id)??0,
  participation: total>0 ? (balance>0?balance/total*100:0):0,
  assetsLabel: "0 assets" (fixo, conforme resposta — lógica futura ajustará),
  color: normalizeColor(w.color,i)
})).sort((a,b)=>b.balance-a.balance)
```

* `normalizeColor` igual ao Analysis (`/^#([0-9A-Fa-f]{3}){1,2}$/` + FALLBACK_COLORS 10 cores).
* `formatUSD` via `Intl.NumberFormat("en-US",{currency:"USD"})` + `tabular-nums`.
* Ordenação `b.balance - a.balance` garante maior saldo primeiro.

**Tabela — 4 colunas sem header:**

* Container `ul divide-y divide-border-subtle`, linha `grid grid-cols-[32px_1fr_auto_96px] gap-3 items-center py-2.5`:
  1. **Icon:** `h-8 w-8 rounded-lg bg-surface-elevated border` + `Wallet h-4 w-4 text-foreground-muted`
  2. **Nome+Tipo:** `flex flex-col min-w-0` → `span truncate text-xs font-medium` (name) + `span text-[10px] uppercase tracking-wide text-foreground-muted` (type)
  3. **Saldo+Assets:** `flex flex-col items-end` → `span text-xs font-semibold tabular-nums` (`$1,234.56`) + `span text-[10px] text-foreground-muted` (`0 assets`)
  4. **Participação:** `flex flex-col gap-1 w-24` → `span text-[10px] tabular-nums text-right` (`12.3%` via `toFixed(1)`) + `div h-1.5 rounded-full bg-border-subtle` > `div h-full rounded-full width% = min(100,participation)` + `background: color`
* `truncate` + `title` para nomes longos; `tracking-tight` para valores.

**Estados:**

* `isLoading` (wallets || transactions) → `LoadingState "Loading wallets..."` dentro de `w-120 border bg-surface rounded-xl p-4`
* `isError` (query) → `ErrorState "Unable to load wallets" + Try again` (refetch ambas)
* `hasNegative` → `ErrorState "Negative balance detected" description com totalBalance` (exigido: saldo negativo nunca deve ocorrer; se backend permitir, mostrar erro)
* `rows.length===0` → `EmptyState "No wallets yet"`
* Container externo sempre `flex flex-col gap-3 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl` preservando `lg:flex-row` da página.

**Tokens & Responsivo:** `border-border`, `bg-surface`, `text-foreground*`, `divide-border-subtle`; coluna lateral já responsiva `w-full lg:w-120` em `wallets-page.tsx:12`; grid de 4 colunas mantém leitura em tablet.

### 2. `pages/wallets-page.tsx:1-45`

```text
- import { ListWallets } from "./Wallets/list-wallets"
- substitui <div>All Wallets List</div> placeholder por <ListWallets />
- mantém flex flex-col lg:flex-row (Summary+Analysis à esquerda, List à direita)
```

Sem restilização além do slot exigido; `PageHeader` intacto.

### Validação

```text
npm run typecheck → ✅ sucesso
npm run lint      → ✅ 0 errors, 2 warnings pre-existentes em app-header.tsx
npm run build     → ✅ sucesso (929 kB com recharts; tsc -b && vite build)
```

### Checklist Fase 5B-Step3

```text
[ x ] Wallets List implementado em list-wallets.tsx (não em wallets-page.tsx)
[ x ] Topo: título "Wallets" + 4 IconButton ghost sm com SimpleTooltip (Deposit/Withdraw/Transfer/Adjust)
[ x ] Tabela sem header, 4 colunas: icon wallet | nome+tipo | saldo+0 assets | participação barra+%
[ x ] Ordenado por maior saldo decrescente (b.balance - a.balance)
[ x ] Saldo formatado $ USD (Intl, tabular-nums)
[ x ] Assets fixo "0 assets" para todos (conforme resposta)
[ x ] Participação = balance/totalBalance*100, barra width = participation% com cor normalizada
[ x ] Saldo negativo → ErrorState "Negative balance detected" (não exibe valor negativo)
[ x ] LoadingState / ErrorState / EmptyState completos com retry
[ x ] Sem saldo inventado (usdValue real via GET /transactions)
[ x ] Sem lógica HTTP na UI (apenas useWalletsQuery/useTransactionsQuery)
[ x ] 4 botões global placeholder (console.log)
[ x ] Dark/Light via tokens
[ x ] Responsive (w-full lg:w-120)
[ x ] typecheck ✓  lint ✓  build ✓
```

Próximos passos: Cards wallets com filtros/sort/pesquisa e All Activities com paginação.
```

---

## 2026-08-30 — Fase 5B-Step4: Cards Wallets (Grid/Table + Filtros + Expansão + BarChart)

**Fase:** 5 — Wallets (UI por Sections)

**Descrição:** Implementação da section do meio (`CardsWallets`) com dois modos de visualização (Grid e Table) comutáveis no topo, filtros de status (`all/active/deactived/archived` sem search), 5 camadas por card (ícone+nome/status, saldo, BarChart azul, barra participação só barra, 4 ações), tabela com colunas `wallet, saldo, assets, status, participação, actions, option` e expansão múltipla (linha/card inteira + seta `ChevronDown`) mostrando tabela vazia de assets com colunas `Asset | Quantity | Purchase | Current Value | PNL` (vazia conforme resposta).

**Arquivos criados/modificados:**

```text
frontend/src/pages/Wallets/cards-wallets.tsx   (implementado — grid/table, filtros, BarChart, expansão)
frontend/src/pages/wallets-page.tsx            (import CardsWallets, substitui placeholder)
frontend/src/components/ui/icon-button.tsx     (fix xs sizeMap: add xs:14)
```

---

### 1. `pages/Wallets/cards-wallets.tsx`

**Topo da section:**

* `flex sm:flex-row justify-between gap-3`
* Esquerda: `flex gap-1` 4 `Button size="sm" h-7` (`all → "all"`, `active`, `inactive → label "deactived"`, `archived`) com `variant={filter===s?"secondary":"ghost"}` e `capitalize`.
* Direita: grupo segmentado `flex rounded-lg border overflow-hidden divide-x divide-border` com 2 `Button size="sm" rounded-none h-7 gap-1.5`:
  * `LayoutGrid` + `Grid` (`viewMode==="grid"` → `secondary`)
  * `Table2` + `Table` (`viewMode==="table"` → `secondary`)
  * `aria-pressed` para acessibilidade, sem gap entre botões.

**Estado & Dados:**

* `useWalletList()` + `useWalletBalances(wallets,transactions)` já ordenado saldo desc (reuso `hooks/` e `lib/`).
* `statusFilter: StatusFilter` + `viewMode: ViewMode` + `expandedIds: Set<string>` (permite múltiplos simultâneos, `toggleExpanded` com `new Set`).
* `filteredRows = rows.map(r=>({...r, status: wallets.find(w=>w.id===r.id)?.status})).filter(all|status)` memoizado.
* `chartById` memoizado: para cada `filteredRows` gera 7 barras sintéticas `BLUE_PALETTE = ["#1e40af","#2563eb","#3b82f6","#60a5fa","#93c5fd","#bfdbfe"]` com `value ~ base*0.18` (mock neutro azul) — usado só no grid. `maxChartValue = max(...)`.
* `isEmptyWallets` via `walletsQuery.pagination.total` para `EmptyState` diferenciado de `filtered 0`.

**Grid (`viewMode==="grid"`):**

* `WalletCard` presentational dentro do mesmo arquivo:
  * Container `role="button" tabIndex 0` com `onClick` + `onKeyDown Enter/Space` expande; `cursor-pointer hover:border`.
  * Camada 1: `flex justify-between` icon `Wallet 8x8` + `name truncate` esq, `Badge status + ChevronDown rotate-180 quando expandido` dir.
  * Camada saldo: `Total Balance` `text-xs muted` + `formatUSD(balance)` `text-lg font-semibold tabular-nums`.
  * Camada BarChart: modelo exato pedido: `ResponsiveContainer 100% h-16` > `BarChart barCategoryGap 20%` > `XAxis hide YAxis hide domain [0,max]` > `ReferenceLine y=0 stroke #374151 dash 3 3` > `Bar dataKey value radius [2,2,0,0] maxBarSize 12` com `Cell fill={entry.color}`; fallback `border-t dashed` se vazio.
  * Barra participação só barra: `h-1.5 rounded-full bg-border-subtle > div width% = min(100,participation)` + `%` à direita pequeno.
  * Ações: `ActionButtons` (4 `IconButton xs ghost` `ArrowDownRight/ArrowUpRight/ArrowLeftRight/SlidersHorizontal` com `SimpleTooltip top`) + `%` texto.
  * Expand: `AssetExpandContent` com grid `grid-cols-5 gap-2 text-[10px] uppercase` header `Asset | Quantity | Purchase | Current Value | PNL` + `div py-6 text-center "No assets"` vazio.
* Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.

**Table (`viewMode==="table"`):**

* Wrapper `overflow-hidden rounded-lg border`
* Header desktop `hidden md:grid grid-cols-[1.4fr_0.9fr_0.6fr_0.8fr_0.9fr_140px_80px_32px] gap-2 px-4 py-2 bg-surface-elevated border-b text-[10px] uppercase` com `Wallet | Saldo | Assets | Status | Participação | Actions | Option |`.
* Linha `grid same cols px-4 py-3 hover:bg-surface-elevated/50 cursor-pointer` com colunas: wallet icon+name/type, saldo `formatUSD` right, assets `0` center, status `StatusBadge`, participação só barra `h-1.5`, actions 4 icons, option `Pencil/Trash2` com tooltip, arrow `ChevronDown rotate`.
* Expand: `col-span-full bg-surface-elevated/30 border-t px-4 pb-3` com mesma `grid grid-cols-5` header 5 colunas vazio.

**Módulos auxiliares:**

* `ActionButtons` local com `stopPropagation` + `console.log` placeholder global.
* `StatusBadge` com `Badge variant success|warning|default`.
* `AssetExpandContent` vazio (5 colunas) conforme resposta 3.
* `BLUE_PALETTE` azul neutro derivado e mantido.

**Hooks/Lib/Types reusados:**

* `hooks/useWalletList` + `hooks/useWalletBalances` (não duplicado), `lib/formats formatUSD`, `lib/wallet-utils normalizeColor` (não reimportado onde desnecessário), `types` inline `WalletCard row` com `status`.

**Estados:**

* `isLoading` → `LoadingState`
* `isError` → `ErrorState + Try again`
* `hasNegative` → `ErrorState Negative balance detected`
* `isEmptyWallets` → `EmptyState No wallets yet`
* `filteredRows 0` → `EmptyState No wallets match filter`

**Tokens & Responsivo:** `border-border bg-surface text-foreground* tabular-nums`, cards grid responsivo, tabela `overflow-hidden` + `hidden md:grid` para header, linhas `grid-cols-1 md:grid-cols-...`.

### 2. `pages/wallets-page.tsx:1-51`

```text
- import { CardsWallets } from "./Wallets/cards-wallets"
- substitui <div>Card Wallets: list...</div> por <div p-4><CardsWallets/></div>
- mantém ListWallets lateral e Summary/Analysis topo sem restilizar
```

### 3. `components/ui/icon-button.tsx:8`

* Fix `iconSizeMap: Record<string,number> = { xs:14, sm:16, md:18, lg:20 }` para suportar `size="xs"` usado em List/Cards.

### Validação

```text
npm run typecheck → ✅ sucesso
npm run lint      → ✅ 0 errors, 2 warnings pre-existentes em app-header.tsx
npm run build     → ✅ sucesso (989 kB com recharts + BarChart; tsc -b && vite build)
```

### Checklist Fase 5B-Step4

```text
[ x ] CardsWallets implementado com grid e table viewModes (botões sem gap, ícone+texto, aria-pressed)
[ x ] Topo esquerda: all/active/deactived(→inactive)/archived filtros (sem search)
[ x ] Grid: 5 camadas por card (icon+nome/status com Chevron, saldo, BarChart modelo fornecido azul, barra participação só barra, 4 ações Ícones ArrowDownRight/ArrowUpRight/ArrowLeftRight/SlidersHorizontal)
[ x ] Table: colunas wallet, saldo, assets (0), status Badge, participação barra, actions 4 ícones, option Pencil/Trash2, header uppercase
[ x ] Expansão múltipla simultânea (Set<string>) via clique linha/card inteira + Chevron rotate-180
[ x ] Expand conteúdo vazio: header Asset | Quantity | Purchase | Current Value | PNL + "No assets"
[ x ] Ordenado por saldo decrescente (via useWalletBalances)
[ x ] Saldo negativo → ErrorState (igual List)
[ x ] Cores barra participação = wallet.color normalizada; BarChart cores BLUE_PALETTE (#1e40af … #bfdbfe)
[ x ] Reuso hooks (useWalletList, useWalletBalances), lib (formatUSD), types inline, sem duplicar HTTP
[ x ] Dark/Light via tokens, tabular-nums, responsive grid/table
[ x ] IconButton xs fix
[ x ] typecheck ✓  lint ✓  build ✓
```

Próximos passos: All Activities tabela com paginação e filtros (All Wallets, All Type, All time).
```

---

## 2026-08-30 — Fase 5B-Step5: Modais Wallet (Add / Edit / Delete / Archive)

**Fase:** 5 — Wallets (UI por Sections + CRUD)

**Descrição:** Criação dos modais de criação, edição, exclusão e arquivamento de wallets. Form add/edit com campos `wallet Name`, `wallet type` (botões em grupo de 3), `description` opcional, `wallet color` via 8 círculos clicáveis, e resumo mostrando `name`, `type`, `color` e `description`. Edit reaproveita UI do Add com valores pré-preenchidos. Delete e Archive são modais simples de confirmação. Integração: `New Wallet` em `wallets-page.tsx` abre Add, `CardsWallets` table abre Edit/Delete/Archive via `Pencil/Archive/Trash2` e redireciona para filtro `archived` após arquivar.

**Arquivos criados/modificados:**

```text
frontend/src/components/ui/dialog.tsx                 (novo primitive modal)
frontend/src/components/modals/add-wallets.tsx        (implementado AddWalletModal com 8 círculos cor + resumo)
frontend/src/pages/Wallets/edit-modal-wallet.tsx      (implementado EditWalletModal — UI igual Add)
frontend/src/pages/Wallets/delete-modal-wallet.tsx    (implementado DeleteWalletModal)
frontend/src/pages/Wallets/archived-modal-wallet.tsx  (implementado ArchiveWalletModal + redirect)
frontend/src/pages/wallets-page.tsx                   (wire AddWalletModal no PageHeader New Wallet)
frontend/src/pages/Wallets/cards-wallets.tsx          (wire Edit/Delete/Archive modals na tabela + fix WalletIcon conflito)
frontend/src/components/ui/icon-button.tsx            (fix xs sizeMap já em Step4)
```

---

### 1. `components/ui/dialog.tsx`

Primitive sem Radix Dialog (inexistente no projeto):

* `Dialog({open,onClose,title,description,children})` via `createPortal(document.body)` com `fixed inset-0 z-50 flex center p-4`, backdrop `bg-foreground/40 backdrop-blur-sm` clicável `onClose`, content `max-w-lg max-h-[90vh] overflow-auto rounded-xl border bg-surface shadow-lg`, header com `title` (`text-lg font-semibold`), `description` (`text-xs muted`) e `IconButton ghost sm X` close. `useEffect` trava `body overflow` e ouve `Escape`. `role="dialog" aria-modal="true"` + `aria-labelledby`. StopPropagation no content.

### 2. `components/modals/add-wallets.tsx` — `AddWalletModal`

* Form `useForm<CreateWalletFormData>({resolver: zodResolver(createWalletSchema), mode:"onChange", defaultValues:{name:"",type:"crypto",color:"",description:""}})`
* Campos:
  * `wallet Name` — `Label required` + `Input id wallet-name {...register("name")} aria-invalid` + erro `text-xs text-danger`
  * `wallet type` — `grid grid-cols-3 gap-2` com `WALLET_TYPES` 6 itens (`exchange/crypto/microwallet` / `hardware/banking/other`). Botão `rounded-lg border p-3 text-xs capitalize` `bg-primary` quando `watch("type")===t` senão `bg-surface hover:bg-surface-elevated`. `onClick setValue("type",t,{shouldValidate,shouldDirty})`
  * `description` — `Textarea rows 3 {...register("description")}`
  * `wallet color` — 8 círculos `COLOR_OPTIONS = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#6366f1"]` com `h-8 w-8 rounded-full border-2` `background:c` + `scale-110 border-foreground` quando selecionado (`watch("color")===c`). Clique setValue. Sem input text (só círculos).
* Resumo: `showSummary = name||type||color||description` → `div rounded-lg border bg-surface-elevated p-3` com `Summary` `dot color + name · type` + `description line-clamp-2`
* Submit: `useCreateWalletMutation` → `payload {name,type,color:color||undefined,description:description||undefined}` → `mutateAsync` → `handleClose reset + onClose` em `onSuccess`; `onError` mapeia `ApiError.code==="WALLET_ALREADY_EXISTS"` → `setServerError`, demais `err.message` em `Alert danger`. Footer `Button outline Cancel` + `Button primary loading Create Wallet disabled={!isValid}`.

### 3. `pages/Wallets/edit-modal-wallet.tsx` — `EditWalletModal`

* UI igual ao Add (requisito). Props `{open,wallet:Wallet|null,onClose}`.
* `useForm<UpdateWalletFormData>({resolver: zodResolver(updateWalletSchema), defaultValues:{name:"",type:undefined,color:"",description:""}})` + `useEffect reset` quando `wallet && open` preenche `wallet.name/type/color/description`.
* Botões type idem, cor 8 círculos. Resumo mostra `watchedName||wallet.name` etc + `description`.
* Submit: computa `payload` diff (só campos alterados vs `wallet`), se vazio `handleClose`; senão `useUpdateWalletMutation({walletId,data:payload})`. Erros `WALLET_ALREADY_EXISTS` e `WALLET_ARCHIVED` → `Alert danger`.

### 4. `pages/Wallets/delete-modal-wallet.tsx` — `DeleteWalletModal`

* Props `{open,wallet,onClose}`. Texto `Delete "name" permanently?` + `This action cannot be undone.`
* Preview `div border bg-surface-elevated p-3` com `name · type`.
* Footer `Cancel` + `Delete Wallet` `variant danger loading` → `useDeleteWalletMutation(wallet.id)` → `onClose` em sucesso. Erro em `Alert danger`.

### 5. `pages/Wallets/archived-modal-wallet.tsx` — `ArchiveWalletModal`

* Props `{open,wallet,onClose,onArchived?:()=>void}`. `Alert warning` `Archiving is irreversible...` + preview idem.
* Footer `Cancel` + `Archive Wallet primary loading` → `useArchiveWalletMutation` → `onClose + onArchived?.()` (chamado para redirecionar). Em `CardsWallets` `onArchived={()=>setStatusFilter("archived")}` cumpre requisito 4.
* Erro em `Alert danger`.

### 6. `pages/wallets-page.tsx:1-60`

* `import {AddWalletModal}` + `const [addOpen,setAddOpen]=useState(false)`
* `PageHeader` `New Wallet` Button `onClick={()=>setAddOpen(true)}` (antes `console.log`)
* Render `<AddWalletModal open={addOpen} onClose={()=>setAddOpen(false)} />` abaixo da página.

### 7. `pages/Wallets/cards-wallets.tsx:3-454`

* Rename `Wallet` lucide → `WalletIcon` para evitar conflito com `type Wallet`.
* Import `EditWalletModal/DeleteWalletModal/ArchiveWalletModal` + `Archive` icon.
* State `editWallet/deleteWallet/archiveWallet: Wallet|null`.
* Tabela `option` coluna adicionado `Archive` botão (`Archive` icon) entre Edit e Delete, todos `onClick` com `wallets.find(x=>x.id===row.id)` → `set...Wallet(w)`.
* Render no fim: `<EditWalletModal open={!!editWallet} wallet={editWallet} onClose={()=>setEditWallet(null)}/>` idem Delete/Archive (Archive com `onArchived={()=>setStatusFilter("archived")}`).

**Reuso hooks/lib/types:**

* `createWalletSchema/updateWalletSchema` de `schemas/wallet.schema.ts`, `WALLET_TYPES` de `types/wallet.types.ts`, mutations de `wallet-queries.ts`, `color` max20 validado, `name` max80, `description` max500 — sem duplicar HTTP.

### Validação

```text
npm run typecheck → ✅ sucesso (fix ApiError.message vs .error.message, WalletIcon alias)
npm run lint      → ✅ 0 errors, 4 warnings (2 app-header + 2 react-hook-form watch incompatible-library)
npm run build     → ✅ sucesso (1,043 kB com recharts; tsc -b && vite build)
```

### Checklist Fase 5B-Step5

```text
[ x ] Dialog primitive criado (portal, backdrop, Escape, body lock)
[ x ] AddWalletModal implementado (add-wallets.tsx) com wallet Name, wallet type (grid 3 colunas), description, wallet color (8 círculos clicáveis), resumo com name+type+color+description
[ x ] EditWalletModal implementado (UI igual Add, prefill, diff payload, resumo)
[ x ] DeleteWalletModal simples (confirmação + danger)
[ x ] ArchiveWalletModal simples (warning irreversível + redirect para archived)
[ x ] New Wallet em wallets-page abre Add
[ x ] CardsWallets table Pencil/Archive/Trash2 abrem Edit/Archive/Delete
[ x ] 8 círculos cor clicáveis (select com scale + border-foreground)
[ x ] Resumo exibindo description também
[ x ] Melhor decisão archive: botão Archive na coluna option (antes Delete)
[ x ] Redirect archived → setStatusFilter("archived")
[ x ] Sem lógica HTTP na UI além de mutations (via wallet-queries)
[ x ] Dark/Light via tokens, accessible (role dialog, aria-modal, aria-invalid)
[ x ] typecheck ✓  lint ✓  build ✓
```

Próximos passos: All Activities tabela com paginação e filtros (All Wallets, All Type, All time) e Skeletons/toasts se necessário.
```

---

## 2026-08-31 — Fase 5B-Step6: Add Transaction Modal (Depósito/Retirada/Transfer/Ajuste)

**Fase:** 5 — Wallets (Operações Financeiras)

**Descrição:** Modal único `AddTransactionModal` com 4 abas (ícone+texto na mesma linha) cobrindo `deposito`, `retirada`, `transferência` e `ajuste`. Campos: `transaction type` (4 abas, default deposito, abre na aba clicada), `Wallet & Current Balance` (select + saldo), `asset & amount` (API `market-data/assets/search` + amount 8 casas), `date & time` (2 inputs), `website` opcional (só deposito/retirada, UI-only aguardando backend), `description` opcional, `Count towards goals` (só deposito, default desativado, e ajuste increase), `status` (Completed/Pending/Failed default Completed UI-only). Casos especiais: transferência mostra `From Wallet & To Wallet` + linha de saldos sem label; ajuste mostra `Adjustment Direction` com botões `+ Add / - Remove`. Lida com seleção Wallet/Asset, quantity, countsTowardGoal, validação, loading, erros API, confirmação/sucesso e invalidação de queries.

**Arquivos criados/modificados:**

```text
frontend/src/features/market-data/api/market-data-api.ts          (novo — searchAssets, convertToUsd)
frontend/src/features/market-data/api/market-data-queries.ts      (novo — useSearchAssetsQuery, useConvertQuery)
frontend/src/components/modals/add-transaction.tsx                (implementado — 4 abas, todos campos, casos especiais, auto usdValue)
frontend/src/pages/wallets-page.tsx                               (wire AddTransactionModal: PageHeader Add Transaction → deposit, initTab)
frontend/src/pages/Wallets/cards-wallets.tsx                      (wire actions: Deposit/Withdraw/Transfer/Adjust com initialWalletId)
```

---

### 1. `features/market-data` — `market-data-api.ts` / `market-data-queries.ts`

* `searchAssets(token,q)` → `GET /market-data/assets/search?q=` + `convertToUsd(token,assetId,quantity)` → `GET /market-data/convert?assetId=&quantity=` (rotas reais `backend/src/app.ts:63` e `market-data.routes.ts:11`). Token Clerk via `apiClient`.
* Hooks: `useSearchAssetsQuery(q, enabled)` (`enabled q.length>=2`, `stale 60s`, key `["market-data","search",q]`) e `useConvertQuery(assetId,quantity, enabled)` (`enabled assetId && quantity>0`, `stale 30s`). Usados para preencher asset e auto-calcular `usdValue`.

### 2. `components/modals/add-transaction.tsx` — `AddTransactionModal`

**Props:** `{open, onClose, initialTab="deposit", initialWalletId?: string}`

**Topo — transaction type:** `grid grid-cols-4 gap-2` 4 botões `flex-col gap-1 rounded-lg border p-3 text-xs` com ícone em cima + texto embaixo (`ArrowDownRight Deposit`, `ArrowUpRight Withdraw`, `ArrowLeftRight Transfer`, `SlidersHorizontal Adjust`) `bg-primary` ativo, senão `bg-surface`. `activeTab` state default `initialTab`; efeito reset ao abrir preenche `initialWalletId` em `walletId/fromWalletId` e limpa demais campos.

**Wallet & Current Balance:**

* Padrão (deposit/withdraw/adjust): `grid grid-cols-2 gap-3` `Select Wallet` (options `useWalletList().wallets` nome+type) + `Current Balance` `div h-10 bg-surface-elevated border tabular-nums` com `formatUSD(balanceMap.get(walletId)??0)` via `useWalletBalances`.
* **Transferência:** `grid 2` `From Wallet` + `To Wallet` Selects (To filtra != From) e abaixo sem label `grid 2` com 2 balanços lado a lado (sem `Label`).
* **Ajuste:** `grid 2` `Wallet + Current Balance` + `Adjustment Direction` `grid 2` botões `+ Add` (`Plus`) / `- Remove` (`Minus`) `variant secondary quando active`.
* Wallet options reusam `wallets` do hook; ícones iguais aos cards (`ArrowDownRight` etc) conforme resposta 3.

**Asset & Amount:** `grid grid-cols-2 gap-3`

* Asset: `Input placeholder Search BTC, ETH...` `value=assetQuery` + dropdown `max-h-32 overflow-auto border` quando `q>=2` mostra `searchQuery.data?.data` (`symbol — name` button seleciona `{externalId,symbol,name}` e seta `assetQuery= symbol - name`). Selecionado mostra `Selected: symbol (externalId) — $usd`.
* Amount: `Input placeholder 0.00000000` `value=quantityStr` `inputMode decimal` filter regex `[^0-9.,]` e clamp `parts[1].length>8` rejeita, `validateQuantity` (required, >0, max 8 casas). Exibe `USD {usdDisplay}` (`convertQuery.isFetching ? Calculating... : formatUSD(usdValue)`).
* `usdValue` auto-calculado via `useConvertQuery(selectedAsset.externalId, quantityNum)` — igual resposta 2 (market-data/convert). Submit bloqueia se `usdValue undefined`.

**Date & Time:** `grid grid-cols-2` `Input type=date` (`dateStr` default `toISOString slice 0,10`) + `Input type=time` (`timeStr` default `toTimeString slice 0,5`) combinados em `buildDate() => new Date(\`\${dateStr}T\${timeStr}:00\`).toISOString()`.

**Website opcional:** só `deposit||withdraw` → `Input placeholder https://...` + nota `Awaiting backend — not sent yet.` Guardado local mas não enviado (resposta 1 aguarda backend).

**Description opcional:** `Textarea rows 2` vazia.

**Count towards goals:** `Checkbox` default `false` só `deposit` (e `adjust` quando `direction==="increase"`), conforme `wallet-operation.schema:33,65` (`default false`).

**Status sem label:** `flex gap-2` 3 `Button sm` `Completed|Pending|Failed` `variant secondary quando active` default `Completed`; só UI (awaiting backend) + nota `Status is UI-only awaiting backend.` Não enviado.

**Validação & Submit:**

* `validateQuantity` + `selectedAsset` + `walletId` (ou `from/to`) + `date` + `quantity>0` + `source≠dest` (transferência) + ajuste direction.
* `buildDate`, `qty=Number(replace comma)`, `usd` do convert.
* Switch `activeTab`:
  * deposit → `useDepositMutation({walletId,asset,quantity,qty,usdValue, dateIso, countsTowardGoal, description})`
  * withdraw → `useWithdrawMutation` (sem counts)
  * transfer → `useTransferMutation({sourceWalletId, destinationWalletId, asset, quantity, usdValue, dateIso, description})`
  * adjust → `useAdjustMutation({walletId,asset,quantity,usdValue,direction,dateIso,countsTowardGoal,description})`
* `isPending` agregado, `serverError` em `Alert danger` (`ApiError.message`), `successMsg` em `Alert success` (`Deposit created successfully.`) + `setTimeout onClose 800ms`. Invalidação automática `walletKeys.all + transactionKeys.all` nos hooks.

### 3. Integração

* `wallets-page.tsx:10` `useState txOpen/txTab` + `Add Transaction Button onClick=>{setTxTab("deposit"); setTxOpen(true)}` + `<AddTransactionModal open={txOpen} onClose=>setTxOpen(false) initialTab={txTab}/>`
* `cards-wallets.tsx:186` `useState txModal {open,tab,walletId}` + `ActionButtons` agora com `onDeposit/onWithdraw/onTransfer/onAdjust` callbacks (parando propagação) que fazem `setTxModal({open:true,tab:"deposit",walletId:row.id})` etc. Render final `<AddTransactionModal open={txModal.open} onClose=>setTxModal({...open:false}) initialTab={txModal.tab} initialWalletId={txModal.walletId}/>` junto aos modais Edit/Delete/Archive.

**Reuso:** `hooks/useWalletList`, `hooks/useWalletBalances`, `lib/formats formatUSD`, `wallet-operations` schemas/types/api/queries (sem HTTP na UI), `components/ui` (`Dialog, Button, Input, Select, Textarea, Checkbox, Alert`) ícones iguais aos cards.

### Validação

```text
npm run typecheck → ✅ sucesso
npm run lint      → ✅ 0 errors, 5 warnings (2 app-header + add-wallets watch + edit-modal watch + add-transaction setState-in-effect)
npm run build     → ✅ sucesso (1,056 kB; tsc -b && vite build)
```

### Checklist Fase 5B-Step6

```text
[ x ] market-data API (searchAssets, convertToUsd) e queries (useSearchAssetsQuery, useConvertQuery)
[ x ] AddTransactionModal único com 4 tipos na mesma linha ícone+texto embaixo, default deposito, abre na aba clicada com wallet prefilled
[ x ] Wallet & Current Balance linha (Select + balance) ; Transfer From/To + saldos sem label ; Adjust Direction + Add/-Remove
[ x ] asset & amount linha: api search criptomoeda + amount 8 casas (clamp) + usdValue auto via market-data/convert + USD display
[ x ] date & time mesma linha
[ x ] website opcional só deposito/retirada (UI-only aguardando backend)
[ x ] description opcional
[ x ] Count towards goals default false só deposito (e adjust increase)
[ x ] status sem label 3 botões Completed/Pending/Failed default Completed UI-only
[ x ] seleção Wallet (Select de wallets existentes) ; seleção Asset (search) ; quantity ; countsTowardGoal ; validação ; loading ; erros API ; confirmação/sucesso ; invalidação queries
[ x ] casos especiais transferência From/To + saldos ; ajuste Direction + add/remove
[ x ] ícone iguais aos cards (ArrowDownRight etc)
[ x ] usdValue auto via market-data/convert
[ x ] website/status aguardam backend (não enviados)
[ x ] integrado em wallets-page Add Transaction e cards-wallets ações (initialTab + initialWalletId)
[ x ] typecheck ✓  lint ✓  build ✓
```

Próximos passos: All Activities tabela com paginação (All Wallets, All Type, All time) e ajustes de saldo negativo já tratados.
```

---

## 2026-08-31 — Fix: Asset Selector — coin-logos catalog + separação search/selected/price

**Fase:** 5 — Wallets (Add Transaction)

**Descrição:** Correção do campo Asset do `AddTransactionModal` que misturava `assetQuery` como termo de pesquisa e representação do selecionado (`value={assetQuery}` + `setAssetQuery(\`\${symbol} - \${name}\`)`), causando buscas estranhas a cada tecla, fragilidade e `Failed to search`. Separação em `assetSearchTerm` (termo) ≠ `selectedAsset` (selecionado) ≠ `price/usdValue` (mercado). Pesquisa agora exclusivamente local via catálogo `coin-logos` curado Top 200 market-cap (≈10KB), com `CoinGecko` mantido só para preço.

**Arquivos criados/modificados:**

```text
frontend/src/features/assets/catalog.ts               (novo — ASSET_CATALOG 200 Top market-cap de CoinGecko markets)
frontend/src/features/assets/types.ts                 (novo — AssetCatalogEntry, LogoSize)
frontend/src/features/assets/logo.ts                  (novo — getCoinLogoUrl CDN jsDelivr)
frontend/src/features/assets/hooks/use-asset-catalog.ts (novo — useAssetCatalogSearch filtro local 20 resultados)
frontend/src/hooks/use-debounce.ts                    (novo — useDebounce 300ms)
frontend/src/components/modals/add-transaction.tsx    (refator — assetSearchTerm vs selectedAsset, debounce 300ms, lista local com logos)
```

---

### 1. Problema identificado

```tsx
// antes
const [assetQuery, setAssetQuery] = useState("");
value={assetQuery}
onChange={e=>setAssetQuery(e.target.value)}
onClick=>{ setSelectedAsset({...}); setAssetQuery(`${a.symbol} - ${a.name}`); }
```

* Mesmo estado para `termo` e `representação` → ao selecionar `BTC - Bitcoin` dispara nova `GET /market-data/assets/search?q=BTC%20-%20Bitcoin` desnecessária, confusão de `enabled q>=2`.
* Sem `debounce` → cada tecla (`B` → `BT` → `BTC`) dispara request → `marketDataLimiter 30/min` + `CoinGecko 429`.
* `usdValue` (convert) acoplado à pesquisa → mistura `qual asset?` + `quanto vale?`.

### 2. Arquitetura proposta (aceita)

```text
Asset Catalog (coin-logos)  ─┐
                             ├─→ APM SYN Assets →  id/symbol/name/logoUrl
Market Data (CoinGecko)     ─┘              │
                                            └─→ price USD (convert)
```

* `coin-logos` **não substitui** CoinGecko; substitui CoinGecko como **catálogo/seleção**. CoinGecko fica só `price`.
* Fonte `simplr-sh/coin-logos` 16.119 logos CDN `https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/<id>/<thumb|small|standard|large>.png`, sem rate-limit.
* Não vendorizar 500MB `images/` nem 8MB `source-with-image-urls.json`; criar camada `features/assets` leve.

### 3. `features/assets` — Asset Catalog

* `catalog.ts` — curado Top 200 por `market_cap_desc` de `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200` (gerado em `2026-09-01` via `curl`, mapeado `{externalId:id, symbol:upper, name}`): `BTC bitcoin`, `ETH ethereum`, `USDT tether`, `BNB binancecoin`, `XRP ripple`, `USDC usd-coin`, `SOL solana`, ... 200 itens `as const` (~10KB gz).
* `types.ts` — `AssetCatalogEntry {externalId,symbol,name}` + `LogoSize thumb|small|standard|large`
* `logo.ts` — `getCoinLogoUrl(id,size="standard")` → `` `${CDN_BASE}/${encodeURIComponent(id)}/${size}.png"` `` + `LOGO_SIZE_PX`. Fallback `onError hidden` no `<img>`.
* `hooks/use-asset-catalog.ts` — `useAssetCatalogSearch(query)` memo filtra `ASSET_CATALOG` onde `symbol|name|externalId includes lower(query)` slice 20, `query<2 → []`. **Exclusivamente local** conforme resposta 2 (sem `useSearchAssetsQuery` remoto).

### 4. `hooks/use-debounce.ts`

* `useDebounce<T>(value,delay)` com `setTimeout/clearTimeout` → `debounced` após `300ms`. Usado para `assetSearchTerm → debouncedTerm` antes de filtrar catálogo.

### 5. `components/modals/add-transaction.tsx` — Refator

* Estados: `const [assetSearchTerm,setAssetSearchTerm]=useState("")` + `const debouncedTerm=useDebounce(assetSearchTerm,300)` + `const catalogResults=useAssetCatalogSearch(selectedAsset?"":debouncedTerm)` + `selectedAsset` separado.
* `Input value={assetSearchTerm} onChange=>{setAssetSearchTerm(e.target.value); if(selectedAsset) setSelectedAsset(null)}` — digitar limpa seleção.
* Dropdown só quando `debouncedTerm.length>=2` → `max-h-40 overflow-auto border`: `catalogResults.length===0 ? No results` : `catalogResults.map(a=> <button key={a.externalId} onClick=>{setSelectedAsset({externalId,symbol,name}); setAssetSearchTerm("")}> <img src={getCoinLogoUrl(a.externalId,"thumb")} /> {symbol} — {name}</button>)`
* **Bloco selecionado separado:**
```
Selected asset
┌──────────────────────────────────┐
│ [logo] BTC · Bitcoin         ✓   │
│        bitcoin                   │
└──────────────────────────────────┘
USD $104,532.12  [ Change asset ]
```
Com `logo thumb 20px`, `externalId` sub, `✓` verde e botão `Change asset` que faz `setSelectedAsset(null); setAssetSearchTerm("")`.
* **Preço separado:** `useConvertQuery(selectedAsset.externalId, quantityNum)` só depende de `selectedAsset` + `quantity`, não de `searchTerm`. `usdDisplay` exibido no bloco selecionado e abaixo de `Amount`.
* Mantém `wallet & balance`, `transfer`/`adjust` casos, `date/time`, `website`/`status` UI-only, validações e mutações.

### Validação

```text
npm run typecheck → ✅ sucesso
npm run lint      → ✅ 0 errors, 5 warnings (2 app-header + 2 add-wallets watch + setState-in-effect)
npm run build     → ✅ sucesso (1,069 kB; tsc -b && vite build)
```

### Checklist Fix Asset

```text
[ x ] catalog.ts 200 Top market-cap com externalId compatível CoinGecko
[ x ] logo.ts getCoinLogoUrl CDN jsDelivr com encodeURIComponent
[ x ] hooks/use-asset-catalog.ts filtro local 20 resultados, q>=2, só local
[ x ] hooks/use-debounce.ts 300ms
[ x ] assetSearchTerm ≠ selectedAsset (setAssetSearchTerm("") no select)
[ x ] dropdown local com logo thumb + symbol — name + Change asset
[ x ] pesquisa exclusivamente local (sem GET /market-data/assets/search)
[ x ] preço CoinGecko mantido só para usdValue (convert)
[ x ] Não mistura pesquisa/seleção/preço
[ x ] typecheck ✓  lint ✓  build ✓
```
```

---

## 2026-09-07 — Fase 8A: Websites Foundation (Types + API + Queries + Mutations)

**Fase:** 8 — Websites

**Descrição:** Criação da fundação frontend da feature Websites: tipos, contratos da API, schemas Zod, query keys, queries TanStack Query e mutations TanStack Query para CRUD completo + lifecycle (archive). Nenhum componente UI ou modal implementado — apenas a camada de dados, idêntica ao padrão estabelecido em `features/wallets/`.

**Backend inspecionado:**

```text
POST   /api/v1/websites              → create    (body: name, url?, description?)  → 201 { data }
GET    /api/v1/websites              → list      (query: page, limit, sort, status?) → 200 { data[], pagination }
GET    /api/v1/websites/:websiteId   → get       → 200 { data }
PATCH  /api/v1/websites/:websiteId   → update    (body: name?, url?, description?) → 200 { data }
POST   /api/v1/websites/:websiteId/archive → archive  → 200 { data }
DELETE /api/v1/websites/:websiteId   → delete    → 204 (no body)
```

Nota: não existe endpoint `activate` para websites (diferente de wallets que têm activate/deactivate). O único lifecycle é `archive`.

**Arquivos criados:**

```text
frontend/src/features/websites/types/website.types.ts
frontend/src/features/websites/schemas/website.schema.ts
frontend/src/features/websites/api/website-api.ts
frontend/src/features/websites/api/website-queries.ts
```

**Arquivos modificados:** nenhum.

---

### 1. `features/websites/types/website.types.ts`

```ts
WebsiteStatus = "active" | "archived"

Website {
  id: string
  userId: string
  name: string
  url?: string
  description?: string
  status: WebsiteStatus
  createdAt: string
  updatedAt: string
}

WEBSITE_STATUSES: WebsiteStatus[]

CreateWebsiteInput { name, url?, description? }
UpdateWebsiteInput { name?, url?, description? }
WebsiteListParams  { page?, limit?, sort?, status? }
```

Reflete o contrato real de `toWebsiteResponse` em `backend/src/services/website.service.ts`. Backend converte `_id` → `id`; frontend nunca vê `_id`. Sem campos inventados.

### 2. `features/websites/schemas/website.schema.ts`

Schemas Zod para validação de formulário (não substitui validação backend):

```text
websiteStatusSchema   → z.enum(["active","archived"])
createWebsiteSchema   → { name: min(1).max(80), url?: http/refine/transform, description?: max(500) } .strip()
updateWebsiteSchema   → mesmos campos optional + refine ≥1 field
websiteListQuerySchema→ { page, limit, sort, status? } .strip()
```

URL validation: regex `^https?:\/\/.+"` com transform empty→undefined (igual backend `httpUrlSchema`). `.strip()` remove campos extras.

### 3. `features/websites/api/website-api.ts`

Camada HTTP pura via `apiClient` centralizado:

```text
getWebsites(token, params?)    → GET  /websites[?...]  → PaginatedResponse<Website>
getWebsite(token, id)          → GET  /websites/:id     → Website  (unwrap .data)
createWebsite(token, body)     → POST /websites         → Website  (unwrap .data)
updateWebsite(token, id, body) → PATCH /websites/:id    → Website  (unwrap .data)
archiveWebsite(token, id)      → POST /websites/:id/archive → Website (unwrap .data)
deleteWebsite(token, id)       → DELETE /websites/:id   → void
```

`buildWebsiteQuery` com `URLSearchParams` para page/limit/sort/status. List retorna `PaginatedResponse` direto; single retorna `ApiResponse` e faz `.data` unwrap. DELETE retorna `Promise<void>` (204).

### 4. `features/websites/api/website-queries.ts`

TanStack Query + query keys:

```text
websiteKeys = {
  all:    ["websites"],
  list:   (params?) => ["websites", "list", params],
  detail: (id)      => ["websites", "detail", id],
}
```

Queries:
```text
useWebsitesQuery(params?)  → GET lista (key: list)
useWebsiteQuery(id)        → GET detalhe (key: detail, enabled: !!id)
```

Mutations:
```text
useCreateWebsiteMutation()       → POST, invalida websiteKeys.all
useUpdateWebsiteMutation()       → PATCH, invalida detail(id) + all
useArchiveWebsiteMutation()      → POST archive, invalida detail(id) + all
useDeleteWebsiteMutation()       → DELETE, invalida websiteKeys.all
```

`getAuthToken()` helper idêntico ao de wallets. Token via `useAuth().getToken()`. Invalidation padrão: create/delete → all; update/archive → detail + all. Nenhum `fetch` espalhado na UI.

### Decisões relevantes

1. **Sem `activate` endpoint** — backend não suporta; wallets têm activate/deactivate, websites somente archive.
2. **Sem `description` no schema frontend na lista** — apenas create/update; list params não incluem description.
3. **Schemas idênticos ao backend** — `httpUrlSchema` com refine+transform replicado no frontend para UX.
4. **4 arquivos, sem hooks/ directory** — wallets não tem `hooks/` directory; queries ficam em `api/` seguindo o padrão existente.
5. **Sem barrel exports** — consumo via deep imports diretos (consistente com wallets).

### Validação

```text
npm run typecheck → ✅ sucesso (0 errors)
npm run lint      → ✅ 0 errors (7 warnings pre-existentes em outros arquivos)
npm run build     → ✅ sucesso (1,157 kB; tsc -b && vite build)
```

### Checklist Fase 8A

```text
[ x ] feature websites criada (features/websites/)
[ x ] tipos criados (Website, WebsiteStatus, CreateWebsiteInput, UpdateWebsiteInput, WebsiteListParams)
[ x ] WebsiteStatus = "active" | "archived" (confirmado backend)
[ x ] inputs criados (CreateWebsiteInput, UpdateWebsiteInput)
[ x ] list params criados (WebsiteListParams)
[ x ] schemas Zod criados (createWebsiteSchema, updateWebsiteSchema, websiteListQuerySchema)
[ x ] API criada (6 endpoints: create, list, get, update, archive, delete)
[ x ] CRUD conectado aos endpoints reais
[ x ] lifecycle conectado (archive — único disponível no backend)
[ x ] query keys padronizadas (websiteKeys.all/list/detail)
[ x ] queries TanStack Query criadas (useWebsitesQuery, useWebsiteQuery)
[ x ] mutations criadas (create, update, archive, delete)
[ x ] invalidação configurada (all prefix + detail específico)
[ x ] nenhuma lógica HTTP na UI
[ x ] nenhuma regra financeira duplicada
[ x ] nenhuma Transaction criada diretamente
[ x ] consistência com Wallets (nomenclatura, padrão, estrutura)
[ x ] npm run typecheck ✓
[ x ] npm run lint ✓
[ x ] npm run build ✓
```

---
