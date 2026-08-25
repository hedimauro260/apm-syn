# APM SYN — Visão Geral do Projeto

## 1. O que é o APM SYN

APM SYN significa **Assets Portfolio Manager Synchronization**.

O APM SYN é um gerenciador de portfólio de ativos digitais desenvolvido como uma evolução do APM Lite.

O sistema permite acompanhar:

- Wallets;
- Websites que geram ganhos;
- Transactions;
- Assets;
- Portfolio;
- Goals;
- evolução financeira.

O principal diferencial do APM SYN é a **sincronização automática das operações financeiras**.

No APM Lite, diferentes partes do sistema são atualizadas manualmente e de forma independente.

No APM SYN, uma única operação deve gerar automaticamente todos os efeitos financeiros relacionados.

---

# 2. Origem do projeto

O APM SYN é um fork conceitual do **APM Lite (Assets Portfolio Manager Lite)**.

O APM Lite foi criado para gerenciar um portfólio pessoal de ativos, permitindo controlar Wallets, Assets, Transactions, Websites e Goals.

Apesar de funcionar, sua arquitetura possui uma limitação importante:

> As operações são muito independentes entre si.

Exemplo no APM Lite:

```text
Website
   ↓
Usuário registra uma retirada
   ↓
Wallet
   ↓
Usuário registra manualmente o valor recebido
   ↓
Asset
   ↓
Usuário registra manualmente o valor do Asset
```

Isso cria trabalho duplicado e aumenta a possibilidade de inconsistências.

O APM SYN nasce para resolver esse problema.

---

# 3. Problema que o APM SYN resolve

O principal problema é a **duplicação manual de informações financeiras**.

Quando uma operação financeira acontece, ela pode afetar diferentes partes do sistema.

Por exemplo, quando um Website envia USDT para uma Wallet:

```text
Website
   ↓
retirada de USDT
   ↓
Wallet recebe USDT
   ↓
Portfolio aumenta
   ↓
Goal pode receber progresso
```

No APM Lite, o usuário precisava registrar essas alterações separadamente.

No APM SYN, a operação será registrada uma única vez.

```text
Website → Wallet
```

O sistema será responsável por registrar e sincronizar os efeitos correspondentes.

---

# 4. Objetivo principal

O objetivo central do APM SYN é:

> **Registrar uma operação financeira uma única vez e permitir que o sistema sincronize automaticamente todos os dados derivados dessa operação.**

A experiência desejada é:

```text
Usuário informa a operação
        ↓
Sistema valida
        ↓
Sistema registra a Transaction
        ↓
Sistema atualiza os dados relacionados
        ↓
Sistema apresenta os dados sincronizados
```

---

# 5. Exemplo principal

Imagine que o usuário possua:

```text
Website:
Crypto Site

Wallet:
Binance

Asset:
USDT

Quantidade:
100
```

O usuário registra:

```text
Retirada de 100 USDT
do Crypto Site
para Binance
```

No APM SYN, essa ação representa:

```text
WEBSITE → WALLET
```

O sistema registra uma Transaction.

A partir dela, os dados relacionados podem refletir:

```text
Website
   ↓
retirada registrada

Wallet
   ↓
recebimento registrado

Portfolio
   ↓
valor atualizado

Goal
   ↓
progresso atualizado, se elegível
```

O usuário não precisa registrar a mesma operação quatro vezes.

---

# 6. Conceito central: sincronização

A palavra **SYN** representa o conceito central do projeto:

> **Synchronization**

A sincronização significa que uma operação financeira possui um único registro de origem e seus efeitos são refletidos nas diferentes visões do sistema.

```text
                    Transaction
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       Wallet         Website        Portfolio
                                         │
                                         ↓
                                       Goals
```

Isso reduz:

- duplicação de dados;
- trabalho manual;
- inconsistências;
- erros de lançamento;
- necessidade de repetir informações.

---

# 7. Conceito de Transaction

A `Transaction` é o principal registro de uma operação financeira.

Ela representa algo que aconteceu.

Exemplos:

```text
External → Wallet
Wallet → External
Website → Wallet
Wallet → Wallet
External → Website
```

Uma Transaction pode representar:

- depósito;
- retirada;
- transferência;
- ganho;
- ajuste.

A Transaction registra a movimentação e suas origens/destinos.

---

# 8. Source e Destination

As Transactions utilizam o conceito de:

```text
source
destination
```

Exemplo:

```json
{
  "source": {
    "type": "WEBSITE",
    "id": "website123"
  },
  "destination": {
    "type": "WALLET",
    "id": "wallet456"
  }
}
```

Isso representa:

```text
Website → Wallet
```

Outro exemplo:

```json
{
  "source": {
    "type": "WALLET",
    "id": "wallet123"
  },
  "destination": {
    "type": "WALLET",
    "id": "wallet456"
  }
}
```

Representa:

```text
Wallet → Wallet
```

Entrada externa:

```json
{
  "source": {
    "type": "EXTERNAL"
  },
  "destination": {
    "type": "WALLET",
    "id": "wallet456"
  }
}
```

Representa:

```text
External → Wallet
```

---

# 9. User

O `User` representa a conta do usuário dentro do APM SYN.

A autenticação e identidade são gerenciadas pelo **Clerk**.

O APM SYN mantém um User interno para armazenar informações específicas da aplicação.

Um User pode possuir:

```text
User
├── Wallets
├── Websites
├── Transactions
└── Goals
```

---

# 10. Wallet

Uma `Wallet` representa um local onde o usuário mantém ativos.

Uma Wallet pode possuir vários Assets.

Exemplo:

```text
Binance
├── USDT
├── BTC
├── ETH
└── ...
```

Os valores dos Assets podem ser convertidos para USD para composição do patrimônio.

Uma Wallet pode receber valores de:

- Websites;
- outras Wallets;
- fontes externas;
- ajustes.

Também pode enviar valores para:

- outras Wallets;
- fontes externas.

---

# 11. Website

Um `Website` representa uma plataforma que gera ganhos para o usuário e da qual podem ser realizadas retiradas.

Exemplo conceitual:

```text
Website
├── Earnings
└── Withdrawals
```

Ganhos:

```text
EXTERNAL → WEBSITE
```

Retirada:

```text
WEBSITE → WALLET
```

No APM SYN, a retirada permite selecionar:

```text
Wallet
Asset
Quantidade
```

O Asset será selecionado através dos dados fornecidos pela **CoinGecko API**.

---

# 12. Assets

Diferentemente do APM Lite, o APM SYN não trata Assets como uma entidade principal persistida no banco.

Os Assets são obtidos através de um serviço externo de Market Data.

O APM SYN utilizará:

```text
CoinGecko API
```

para obter informações sobre os ativos.

O sistema poderá utilizar esses dados para:

- pesquisar Assets;
- selecionar Assets;
- obter preços;
- converter valores para USD;
- identificar ativos utilizados nas operações.

---

# 13. CoinGecko

A CoinGecko será o provedor de dados de mercado do APM SYN.

Fluxo:

```text
APM SYN Backend
       ↓
Market Data Service
       ↓
CoinGecko API
```

O frontend não deverá depender diretamente da CoinGecko.

A API do APM SYN funcionará como intermediária.

Isso permite:

- controlar as chamadas;
- aplicar cache;
- validar dados;
- proteger credenciais;
- normalizar respostas;
- substituir o provedor no futuro, se necessário.

---

# 14. Portfolio

O `Portfolio` representa a visão consolidada do patrimônio do usuário.

Não é uma entidade financeira independente.

É uma visão derivada dos dados existentes.

Conceitualmente:

```text
Transactions
      ↓
Wallets
      ↓
Assets
      ↓
Portfolio
```

O Portfolio pode apresentar informações como:

- patrimônio total em USD;
- distribuição por Wallet;
- distribuição por Asset;
- evolução patrimonial;
- valores atuais dos ativos.

---

# 15. Goals

Uma `Goal` representa uma meta financeira associada a uma ou mais Wallets.

A Goal acompanha o progresso financeiro do usuário.

Exemplo:

```text
Meta semanal:
$500

Wallet A:
$300

Wallet B:
$200

Total:
$500
```

A Goal não cria Transactions.

Ela observa Transactions que sejam consideradas elegíveis.

```text
Transactions
      ↓
Transactions elegíveis
      ↓
Goal
      ↓
Progress
```

Uma Transaction pode ser registrada normalmente sem necessariamente contar para uma Goal.

---

# 16. Elegibilidade de Transactions

Nem toda entrada de dinheiro deve necessariamente contribuir para uma Goal.

Por isso, uma operação de depósito pode possuir uma indicação de que deve ou não ser considerada para uma determinada meta.

Conceitualmente:

```text
Transaction
    │
    ├── financial operation
    │
    └── goal eligible?
```

A Goal utiliza somente as Transactions que satisfazem suas regras de elegibilidade.

---

# 17. Principais tipos de operação

O APM SYN trabalha principalmente com:

```text
Deposit
Withdraw
Transfer
Adjust
Earning
```

Relacionamentos conceituais:

```text
Deposit
EXTERNAL → WALLET

Withdraw
WALLET → EXTERNAL

Transfer
WALLET → WALLET

Earning
EXTERNAL → WEBSITE

Website Withdrawal
WEBSITE → WALLET

Adjust
EXTERNAL → WALLET
ou
WALLET → EXTERNAL
```

A representação exata depende da operação.

---

# 18. Operações da Wallet

Wallet possui operações administrativas:

```text
Create
Read
List
Update
Deactivate
Archive
Delete
```

E operações financeiras:

```text
depositToWallet()
withdrawFromWallet()
transferBetweenWallets()
adjustWallet()
```

Essas operações geram Transactions.

---

# 19. Operações do Website

Website possui operações administrativas:

```text
Create
Read
List
Update
Archive
Delete
```

E operações financeiras:

```text
recordEarning()
withdrawFromWebsite()
```

Essas operações geram Transactions.

---

# 20. Operações de Transaction

Transactions podem ser:

```text
Create
Read
List
Update
Delete
```

Uma Transaction pode ser editada, mas existem campos estruturais que não devem ser alterados de maneira arbitrária.

Entre eles estão os elementos que definem a natureza da operação, como:

```text
source
destination
type
```

As regras específicas de edição estão definidas na documentação de regras de negócio.

---

# 21. Operações de Goal

Goals possuem:

```text
Create
List
Read
Archive
```

Além disso:

```text
Calculate Progress
Read Progress
Generate Snapshot
```

A Goal não cria Transactions.

Ela apenas observa o histórico financeiro.

---

# 22. Modelo financeiro

O APM SYN utiliza uma abordagem baseada em movimentação.

A ideia central é:

```text
Dinheiro/Asset
      ↓
Movimentação
      ↓
Transaction
```

A Transaction descreve o movimento entre uma origem e um destino.

Exemplo:

```text
Website
   │
   │ 100 USDT
   ▼
Wallet
```

---

# 23. USD como referência

O APM SYN trabalha com múltiplos Assets.

Porém, para análise patrimonial, os valores são convertidos para USD.

Exemplo:

```text
Wallet
├── 100 USDT
├── 0.01 BTC
└── 2 ETH
```

Pode ser representada financeiramente como:

```text
USDT → USD
BTC  → USD
ETH  → USD
```

O valor em USD é utilizado para:

- Portfolio;
- análise patrimonial;
- Goals quando aplicável;
- comparações;
- métricas financeiras.

---

# 24. Diferença entre APM Lite e APM SYN

## APM Lite

As entidades possuem operações mais independentes.

Exemplo:

```text
Website
   ↓
registrar retirada

Wallet
   ↓
registrar entrada manualmente

Asset
   ↓
registrar alteração manualmente
```

O usuário é responsável por manter as partes sincronizadas.

---

## APM SYN

A operação é centralizada.

```text
Website
   ↓
Withdrawal
   ↓
Wallet + Asset
   ↓
Transaction
   ↓
dados derivados
```

O sistema assume a responsabilidade pela sincronização.

---

# 25. Exemplo comparativo

### APM Lite

Usuário recebe:

```text
100 USDT
```

do Website para uma Wallet.

Precisa:

```text
1. registrar retirada no Website
2. registrar entrada na Wallet
3. atualizar Asset
```

---

### APM SYN

Usuário informa:

```text
Website: Site X
Wallet: Binance
Asset: USDT
Quantidade: 100
```

E executa:

```text
Withdraw
```

O sistema registra a operação e utiliza a Transaction para refletir os efeitos relacionados.

---

# 26. Fonte da verdade

O histórico de Transactions é fundamental para representar o histórico financeiro.

Conceitualmente:

```text
                Transactions
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
    Wallet        Website       Portfolio
       │
       ↓
     Goals
```

As diferentes telas não devem criar versões independentes da mesma operação.

---

# 27. Sincronização

A sincronização não significa necessariamente que todas as entidades precisam ser fisicamente atualizadas ao mesmo tempo.

Ela significa que o sistema mantém uma representação consistente da operação.

Exemplo:

```text
Uma retirada
     ↓
uma operação de domínio
     ↓
uma Transaction
     ↓
efeitos financeiros derivados
```

O usuário não precisa repetir os mesmos dados em diferentes módulos.

---

# 28. Arquitetura conceitual

O sistema pode ser visualizado em quatro níveis:

```text
┌───────────────────────────┐
│       Interface           │
│ React + Tailwind          │
└─────────────┬─────────────┘
              │
┌─────────────▼─────────────┐
│       Application API     │
│ Express + Controllers     │
└─────────────┬─────────────┘
              │
┌─────────────▼─────────────┐
│       Domain              │
│ Services + Transactions   │
└─────────────┬─────────────┘
              │
┌─────────────▼─────────────┐
│       Persistence         │
│ MongoDB + Mongoose        │
└───────────────────────────┘
```

Serviços externos:

```text
Clerk
CoinGecko
```

---

# 29. Tecnologias

## Frontend

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

## Backend

```text
Node.js
Express
TypeScript
MongoDB
Mongoose
Zod
Clerk
```

## Market Data

```text
CoinGecko API
```

---

# 30. Princípios do projeto

O APM SYN deve seguir os seguintes princípios:

### 30.1 Registrar uma vez

O usuário deve informar uma operação uma única vez sempre que possível.

### 30.2 Sincronizar automaticamente

Os efeitos da operação devem ser refletidos nas partes correspondentes do sistema.

### 30.3 Transaction como registro da movimentação

Movimentações financeiras devem ser representadas por Transactions.

### 30.4 Backend como autoridade

As regras financeiras pertencem ao backend.

### 30.5 Goals observam, não criam

Goals não criam depósitos nem Transactions.

### 30.6 Portfolio é derivado

Portfolio representa uma visão consolidada do patrimônio.

### 30.7 Assets vêm do Market Data

Assets não são cadastrados manualmente como uma entidade independente.

### 30.8 Autenticação delegada

Clerk gerencia autenticação e identidade.

### 30.9 Dados de mercado externos

CoinGecko fornece os dados necessários sobre os Assets e seus preços.

---

# 31. O que o APM SYN não pretende ser

O APM SYN não pretende ser:

- uma corretora;
- uma carteira de criptomoedas;
- um sistema de pagamentos;
- um sistema contábil tradicional;
- uma plataforma para executar trades;
- uma exchange;
- um sistema de custódia de ativos.

O sistema é um **gerenciador de portfólio e acompanhamento financeiro pessoal**.

Ele registra e organiza informações financeiras fornecidas pelo usuário e dados de mercado obtidos através de serviços externos.

---

# 32. Escopo conceitual

O núcleo do APM SYN é:

```text
User
 │
 ├── Wallets
 │      │
 │      └── Transactions
 │
 ├── Websites
 │      │
 │      └── Transactions
 │
 ├── Transactions
 │
 └── Goals
        │
        └── Transactions elegíveis
```

Portfolio é uma visão derivada dessas informações.

Assets são obtidos através da integração com Market Data.

---

# 33. Fluxo principal do sistema

O fluxo mais importante do APM SYN é:

```text
Usuário
   ↓
Seleciona Website
   ↓
Seleciona Wallet
   ↓
Seleciona Asset
   ↓
Informa quantidade
   ↓
Executa retirada
   ↓
Backend valida operação
   ↓
Transaction é criada
   ↓
Sistema sincroniza os efeitos
   ↓
Wallet / Website / Portfolio / Goal
```

---

# 34. Visão final

O APM SYN pode ser resumido em uma ideia:

> **Uma operação financeira deve ser registrada uma única vez e o sistema deve cuidar do restante.**

O APM Lite colocou o usuário no papel de sincronizador.

O APM SYN pretende retirar esse trabalho do usuário.

```text
APM Lite

Usuário
 ├── registra Website
 ├── registra Wallet
 └── registra Asset
        ↓
      manual


APM SYN

Usuário
      │
      ▼
Uma operação
      │
      ▼
Transaction
      │
      ▼
Sistema sincroniza
```

Essa é a principal evolução do APM Lite para o APM SYN.
