# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.10.0]

### Added

- Painel de visão geral (dashboard) com dados consolidados.
- Página de Goals com API, UI e hooks integrados.
- Página de atividades com componentes dedicados.
- Saldos em USD no frontend e reestruturação da estrutura de front-end.
- Página de portfólio com dados de preços de mercado.
- Modal de transações, operações financeiras e catálogo de ativos.
- Página de Wallet completa com autenticação Clerk.
- App shell com navegação, sidebar e header.
- Componentes de interface reutilizáveis (UI).
- Inicialização do frontend com React, TypeScript, Vite e Tailwind CSS 4.
- Inicialização do backend com Express, TypeScript, Zod 4, MongoDB e Clerk.
- Documentação de arquitetura do projeto em `docs/architecture.md`.

### Changed

- Realocação da documentação do projeto para o diretório `docs/`.

## [0.1.0] - 2026-08-25

### Added

- Commit inicial do projeto APM SYN.
- Estrutura monorepo com `backend/` e `frontend/`.
- Configuração de scripts de dev, build, lint, typecheck e test na raiz.
- `concurrently` para executar backend e frontend simultaneamente.
- Licença do projeto.

[Unreleased]: https://github.com/seu-usuario/apm-syn/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/seu-usuario/apm-syn/releases/tag/v0.1.0
