# APM SYN — Regras de Operações

### 1. User

Suas operações fazem sentido:

- criar/sincronizar perfil;
- obter perfil;
- atualizar dados do perfil;
- excluir conta/dados;
- gerar backup.

Sobre o backup: **sim, eu considero uma operação relacionada ao User**, mas não necessariamente uma operação da entidade `User` no sentido de domínio.

Eu colocaria como:

```text
User Data Management
├── exportBackup()
└── importBackup() ?
```

O backup representa os **dados pertencentes ao usuário**, não uma alteração no próprio perfil.

Isso será particularmente útil porque você já teve problemas no APM Lite com compatibilidade de backups entre versões. Então, no APM SYN, eu gostaria de tratar backup como um recurso próprio da aplicação, com versionamento desde o começo:

```text
Backup
├── version
├── exportedAt
├── data
│   ├── wallets
│   ├── websites
│   ├── transactions
│   └── goals
```

Não precisamos criar a entidade `Backup` agora. Pode ser simplesmente uma operação de exportação. Mas **`backupVersion` deve existir no formato exportado**. Isso nos salvará do vilão da temporada “backup da versão antiga não importa mais” 😂.

Sobre o Clerk, sua divisão está correta:

**Clerk**

- login;
- logout;
- alterar senha;
- reset password;
- gerenciamento de sessão.

**APM SYN**

- sincronizar perfil;
- armazenar dados próprios da aplicação;
- atualizar preferências/dados internos;
- excluir dados da aplicação.

Só existe uma operação que precisaremos definir melhor no futuro: **excluir conta/dados**. Apagar apenas os dados do MongoDB é diferente de apagar também a conta no Clerk. Mas isso é detalhe de implementação/política e podemos deixar para a etapa das regras.

---

### 2. Wallet

O CRUD está coerente:

```text
createWallet()
getWallet()
listWallets()
updateWallet()
deactivateWallet()
archiveWallet()
deleteWallet()
```

Decisão consolidada (Fase 5):

```text
ACTIVE ──deactivate──▶ INACTIVE ──activate──▶ ACTIVE
  │                       │
  └──────archive──────────┴──▶ ARCHIVED (irreversível)
ACTIVE ──archive──▶ ARCHIVED
```

- `active`: operacional
- `inactive`: desativada temporariamente, reativável via `POST /:id/activate` (`inactive → active`)
- `archived`: encerrada/histórica, irreversível; `POST /:id/activate` em `archived` retorna `409 WALLET_ARCHIVED`; `PATCH`/operações em `archived` retornam `409`.

Agora, a parte financeira ficou muito boa:

```text
depositToWallet()
withdrawFromWallet()
transferBetweenWallets()
adjustWallet()
```

Eu alteraria apenas o nome `withdrawToWallet()` para `withdrawFromWallet()`, porque semanticamente o dinheiro sai da wallet.

E esta sua regra merece destaque:

> Essas operações não alteram `Wallet.balance`. Apenas geram `Transactions`.

Eu transformaria isso em:

> **Nenhuma operação financeira altera diretamente os saldos persistidos da Wallet. O estado financeiro é determinado pelas Transactions.**

Só faço uma observação importante: como agora uma wallet possui vários assets, eu evitaria até pensar em um único:

```text
Wallet.balance
```

Teremos algo mais próximo de:

```text
Wallet
└── balances
    ├── BTC
    ├── ETH
    └── USDT
```

E esses saldos são consequência das transactions.

Exemplo:

```text
depositToWallet()
       ↓
Transaction criada
       ↓
asset: BTC
quantity: 0.005
usdValue: 300
```

A posição da wallet é então calculada a partir do histórico.

---

### 3. Website

Também está bastante consistente:

```text
createWebsite()
getWebsite()
listWebsites()
updateWebsite()
archiveWebsite()
deleteWebsite()
```

Operações financeiras:

```text
recordEarning()
withdrawFromWebsite()
```

E vale exatamente a mesma regra:

> Website não deve ter o saldo financeiro alterado diretamente por essas operações. Elas geram Transactions.

Por exemplo:

```text
recordEarning()
        ↓
Transaction
type: WEBSITE_EARNING
        ↓
Website balance é recalculado
```

E:

```text
withdrawFromWebsite()
        ↓
Transaction
type: WEBSITE_WITHDRAWAL
source: Website
destination: Wallet
        ↓
Saldo do Website e posição da Wallet são refletidos
```

Aqui está uma das partes mais bonitas do SYN: **uma única Transaction pode afetar mais de uma visualização do sistema**.

Não precisamos criar três registros manualmente para Website, Wallet e Asset. A mesma transação pode ser interpretada por cada parte.

---

## 4. Transaction

Aqui eu faria uma distinção importante.

Você listou:

- criar;
- consultar;
- listar;
- editar;
- deletar.

Mas, conceitualmente, eu evitaria que o frontend tivesse um `createTransaction()` genérico para todos os casos.

Por quê?

Porque estas operações:

```text
depositToWallet()
withdrawFromWallet()
transferBetweenWallets()
adjustWallet()
recordEarning()
withdrawFromWebsite()
```

**já são as formas de criar uma Transaction**.

Ou seja:

```text
depositToWallet()
       ↓
creates Transaction
```

```text
withdrawFromWebsite()
       ↓
creates Transaction
```

Isso protege as regras de negócio.

Então eu modelaria as operações de `Transaction` como:

```text
getTransaction()
listTransactions()
updateTransaction()
deleteTransaction()
```

Enquanto a criação acontece através da operação financeira apropriada.

Assim não teremos uma API perigosa como:

```text
POST /transactions
{
  "type": "WHATEVER",
  "source": "...",
  "destination": "..."
}
```

com o frontend podendo criar combinações que o domínio nunca deveria aceitar. O caos instalado, Thanos estalando os dedos e metade dos saldos desaparecendo.

### Sobre edição

Sua regra é excelente:

> Tudo pode ser editado, exceto a wallet e o tipo da transaction.

Eu só traduziria “wallet” para uma regra mais precisa:

> **Uma Transaction não pode ter sua origem/destino estrutural alterados após a criação.**

Por exemplo:

```text
Website A → Wallet B
```

Não pode virar:

```text
Website A → Wallet C
```

Nem:

```text
Wallet A → Wallet B
```

porque isso muda a identidade do evento.

O mesmo vale para:

```text
type
```

Mas poderiam ser editáveis:

```text
amount / quantity
usdValue
date
description
countsTowardGoal
```

Isso ainda precisamos validar por tipo de transação.

---

## Source e Destination

Aqui você acertou em cheio. 👏

Eu manteria esse modelo conceitual.

**Website → Wallet**

```text
source:
  type: WEBSITE
  id: website123

destination:
  type: WALLET
  id: wallet456
```

**Wallet → Wallet**

```text
source:
  type: WALLET
  id: wallet123

destination:
  type: WALLET
  id: wallet456
```

**Entrada externa → Wallet**

```text
source:
  type: EXTERNAL

destination:
  type: WALLET
  id: wallet456
```

Eu acrescentaria mais dois casos.

**Wallet → externo**

Para retirada manual:

```text
source:
  type: WALLET
  id: wallet123

destination:
  type: EXTERNAL
```

**Website → saldo interno**

Para um ganho:

Aqui talvez seja onde o modelo `source/destination` precise de um pequeno refinamento. Um earning não está realmente saindo do Website para algum lugar; ele está **aumentando o saldo daquele Website**.

Portanto, talvez:

```text
type: WEBSITE_EARNING

websiteId: website123

source: EXTERNAL
destination: WEBSITE
```

ou simplesmente tratarmos `Website` também como um destino válido:

```text
source:
  type: EXTERNAL

destination:
  type: WEBSITE
  id: website123
```

Isso deixaria o modelo muito consistente.

Então, eu ampliaria:

```text
EndpointType
├── WALLET
├── WEBSITE
└── EXTERNAL
```

E uma Transaction sempre possui:

```text
source
destination
```

dependendo do tipo.

O mapa passa a ser:

```text
EXTERNAL → WALLET      depósito manual
WALLET   → EXTERNAL    retirada manual

WALLET   → WALLET      transferência

EXTERNAL → WEBSITE     ganho

WEBSITE  → WALLET      retirada de website
```

Isso, sinceramente, é um modelo bem elegante. 🔥

---

### 5. Goal

Suas operações estão muito boas:

```text
createGoal()
listGoals()
getGoal()
archiveGoal()

calculateProgress()
getProgress()
generateSnapshot()
```

E sua nota é fundamental:

> **Goal não cria depósitos. Ela apenas observa Transactions elegíveis.**

Eu colocaria isso como regra explícita do domínio.

A relação seria:

```text
Transaction
    │
    │ eligible?
    ▼
Goal engine
    │
    ▼
Progress
```

Para uma Transaction ser considerada, provavelmente precisará cumprir simultaneamente regras como:

```text
✓ pertence ao User da Goal
✓ destination é uma Wallet participante
✓ tipo é elegível
✓ countsTowardGoal = true
✓ data está dentro do período
✓ Goal está ativa
```

E, quando a Goal for arquivada:

```text
archiveGoal()
      ↓
calculate final progress
      ↓
generate snapshot
      ↓
Goal.status = ARCHIVED
```

O snapshot preserva o resultado histórico mesmo que, posteriormente, alguma wallet ou transaction seja alterada.

---

### Minha consolidação da etapa 4

```text
USER
├── syncProfile()
├── getProfile()
├── updateProfile()
├── deleteAccountAndData()
└── exportBackup()

WALLET
├── createWallet()
├── getWallet()
├── listWallets()
├── updateWallet()
├── deactivateWallet()
├── archiveWallet()
└── deleteWallet()

Operações financeiras
├── depositToWallet()
├── withdrawFromWallet()
├── transferBetweenWallets()
└── adjustWallet()

WEBSITE
├── createWebsite()
├── getWebsite()
├── listWebsites()
├── updateWebsite()
├── archiveWebsite()
└── deleteWebsite()

Operações financeiras
├── recordEarning()
└── withdrawFromWebsite()

TRANSACTION
├── getTransaction()
├── listTransactions()
├── updateTransaction()
└── deleteTransaction()

GOAL
├── createGoal()
├── getGoal()
├── listGoals()
├── archiveGoal()
├── calculateProgress()
├── getProgress()
└── generateSnapshot()
```

E fixado três princípios que surgiram naturalmente da sua modelagem:

**1. Operações financeiras criam Transactions; não alteram saldos diretamente.**

**2. `Transaction` é a fonte da história financeira. Wallets e Websites refletem essa história.**

**3. `Goal` não movimenta dinheiro; apenas observa Transactions elegíveis.**
