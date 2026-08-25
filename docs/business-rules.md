# APM SYN — Regras de Negócio e Invariantes

## 1. Princípios fundamentais

### 1.1 Transaction é a fonte da verdade financeira

Toda movimentação financeira do sistema deve ser registrada como uma `Transaction`.

Saldos de `Wallets`, `Websites`, posições de `Assets` e progresso de `Goals` são consequências das `Transactions` registradas.

Nenhuma operação financeira deve alterar diretamente um saldo como única fonte de registro.

---

### 1.2 Operações financeiras não modificam entidades diretamente

Operações como:

- `depositToWallet()`
- `withdrawFromWallet()`
- `transferBetweenWallets()`
- `adjustWallet()`
- `recordEarning()`
- `withdrawFromWebsite()`

devem criar ou modificar `Transactions`.

Os efeitos financeiros são determinados a partir dessas `Transactions`.

---

### 1.3 Toda Transaction pertence a um único User

Toda `Transaction` deve possuir um proprietário.

Uma `Transaction` não pode envolver `Wallets`, `Websites` ou `Goals` pertencentes a outro usuário.

---

### 1.4 Dados financeiros de usuários são isolados

Um usuário só pode consultar, criar, editar ou excluir:

- suas próprias `Wallets`;
- seus próprios `Websites`;
- suas próprias `Transactions`;
- suas próprias `Goals`.

---

## 2. Regras de Wallet

### 2.1 Wallet pode possuir múltiplos assets

Uma `Wallet` pode possuir quantidades de múltiplos assets simultaneamente.

Exemplo:

```text
Binance
├── BTC
├── ETH
└── USDT
```

---

### 2.2 Asset não é cadastrado manualmente pelo usuário

Assets utilizados pelo sistema devem ser selecionados a partir de um catálogo obtido por API externa.

O usuário não pode criar, editar ou excluir assets do catálogo.

---

### 2.3 Wallet não possui uma única fonte de saldo

Uma wallet não deve possuir um único `balance` representando toda a sua situação financeira.

O saldo é composto pelas posições dos assets existentes na carteira e pelos seus respectivos valores convertidos em USD.

---

### 2.4 Toda movimentação de Wallet deve possuir uma Transaction

Depósitos, retiradas, transferências e ajustes devem possuir uma `Transaction` correspondente.

Não é permitido alterar manualmente uma posição financeira da Wallet sem registro de Transaction.

---

### 2.5 Wallet possui três estados distintos: active, inactive, archived

- `active`: operacional, aceita CRUD e futuras operações financeiras
- `inactive`: temporariamente desativada via `POST /:id/deactivate`; pode voltar a `active` via `POST /:id/activate`
- `archived`: encerrada/histórica via `POST /:id/archive`; irreversível, não volta a `active` nem `inactive`

```
active ──deactivate──▶ inactive ──activate──▶ active
  │                       │
  └──────archive──────────┴──▶ archived (terminal)
active ──archive──▶ archived
```

---

### 2.6 Wallet arquivada não recebe novas movimentações

Uma `Wallet` com `status=archived` não pode ser utilizada como origem ou destino de novas `Transactions` e não aceita `PATCH`, `deactivate` ou `activate`. Qualquer tentativa retorna `409 WALLET_ARCHIVED`.

Seu histórico permanece disponível para consulta.

---

### 2.7 Wallet desativada (inactive) não pode receber novas operações (Fase 7)

`inactive` bloqueia **todas** as operações financeiras: `deposit, withdraw, transfer, adjust` → `409 WALLET_INACTIVE`. Wallet precisa estar `active` para qualquer movimentação; para corrigir `inactive` deve `activate → adjust`.

### 2.8 Saldo insuficiente (Fase 7)

`withdraw` e `transfer` (e `adjust decrease`) não podem resultar em saldo negativo. Saldo é derivado de Transactions por `(walletId, asset.externalId)` via `TransactionRepository.getWalletAssetBalance`; se `requestedQuantity > available` → `422 INSUFFICIENT_BALANCE`. Concorrência avaliada; check otimista + validação no Service.

### 2.9 Ajuste em inactive (Fase 7)

Mesmo sendo correção, `adjust` em `inactive` é bloqueado `409 WALLET_INACTIVE` (sem exceção). Ativar antes de ajustar.

### 2.10 CountsTowardGoal (Fase 7)

- `deposit`: `true|false`, default `false`
- `adjust increase`: `true|false`, default `false`; `adjust decrease`: sempre `false`
- `withdraw, transfer`: sempre `false` (ignora campo do cliente)

### 2.11 Transfer (Fase 7)

Rota `POST /api/v1/wallet-transfers` de primeiro nível; valida `sourceWalletId ≠ destinationWalletId` e ownership de ambas.

### 2.12 Exclusão de Wallet não pode destruir histórico financeiro

---

### 2.7 Exclusão de Wallet não pode destruir histórico financeiro

Uma Wallet que possua `Transactions` associadas não deve ser removida de forma que torne o histórico financeiro inconsistente.

Quando necessário, a Wallet deve ser desativada ou arquivada em vez de excluída permanentemente.

---

## 3. Regras de Website

### 3.1 Website representa uma fonte de ganhos

Um `Website` pode registrar ganhos e retiradas.

Ganhos aumentam seu saldo financeiro.

Retiradas reduzem seu saldo financeiro.

---

### 3.2 Ganhos devem ser registrados como Transaction

Um ganho registrado em um Website deve gerar uma `Transaction`.

O saldo do Website é consequência do conjunto de suas Transactions.

---

### 3.3 Retirada de Website deve gerar uma única operação financeira vinculada

Uma retirada de Website deve registrar uma `Transaction` que represente simultaneamente:

```text
Website → Wallet
```

A Transaction deve identificar:

- Website de origem;
- Wallet de destino;
- Asset recebido;
- quantidade do asset;
- valor correspondente em USD;
- data da operação.

---

### 3.4 Retirada não pode exceder o saldo disponível

Uma retirada de Website não pode resultar em saldo negativo, exceto quando uma regra futura específica permitir ajustes negativos.

---

### 3.5 Website arquivado não aceita novas operações

Um Website arquivado não pode registrar novos ganhos ou retiradas.

Seu histórico permanece disponível.

---

### 3.6 Exclusão de Website não pode destruir histórico financeiro

Um Website com Transactions associadas não deve ser removido de forma que invalide o histórico.

Arquivamento deve ser preferido à exclusão quando houver histórico financeiro.

---

## 4. Regras de Transaction

### 4.1 Transaction representa um evento financeiro

Uma Transaction deve representar um fato ocorrido no sistema.

Ela deve possuir informações suficientes para identificar:

- tipo;
- origem;
- destino;
- asset;
- quantidade;
- valor em USD;
- data;
- proprietário.

---

### 4.2 Toda Transaction possui origem e destino conceituais (Fase 6: `date` oficial, sem `occurredAt`; discriminated union `WALLET/WEBSITE` exigem `id`, `EXTERNAL` proíbe `id`; matriz `type↔source↔destination` validada; `POST /transactions` genérico com validação + ownership)

Os participantes possíveis são:

```text
WALLET
WEBSITE
EXTERNAL
```

Exemplos válidos:

```text
EXTERNAL → WALLET
```

Depósito manual.

```text
WALLET → EXTERNAL
```

Retirada manual.

```text
WALLET → WALLET
```

Transferência entre wallets.

```text
EXTERNAL → WEBSITE
```

Registro de ganho.

```text
WEBSITE → WALLET
```

Retirada de Website.

---

### 4.3 Tipo da Transaction é imutável

Após a criação, o `type` de uma Transaction não pode ser alterado.

Alterar o tipo significa alterar a natureza do evento financeiro.

---

### 4.4 Origem e destino estruturais são imutáveis

Após a criação, uma Transaction não pode ter seus participantes estruturais alterados.

Exemplo:

```text
Website A → Wallet A
```

não pode ser editada para:

```text
Website B → Wallet B
```

Essa alteração deve ser tratada pela exclusão da Transaction original e criação de uma nova operação válida, quando permitido.

---

### 4.5 Dados financeiros editáveis devem ser recalculados

Quando uma Transaction permitir edição de:

- quantidade;
- valor em USD;
- data;
- descrição;
- elegibilidade para Goal;

todos os efeitos derivados dessa Transaction devem refletir imediatamente a nova informação.

---

### 4.6 Transaction inválida não pode deixar efeitos parciais

Uma operação que envolva múltiplas alterações relacionadas deve ser processada de forma atômica.

Se uma etapa falhar, nenhuma alteração parcial deve permanecer registrada.

---

### 4.7 Exclusão de Transaction deve remover seus efeitos

Ao excluir uma Transaction, seus efeitos devem deixar de ser considerados em:

- saldos de Websites;
- posições de Wallets;
- valores consolidados em USD;
- progresso de Goals.

---

### 4.8 Transaction não pode pertencer a mais de um User

Origem, destino e proprietário de uma Transaction devem pertencer ao mesmo User, exceto participantes do tipo `EXTERNAL`.

---

## 5. Regras de transferências

### 5.1 Transferência ocorre entre duas Wallets

Uma transferência deve possuir:

```text
source: WALLET
destination: WALLET
```

---

### 5.2 Origem e destino devem ser diferentes

Uma Wallet não pode transferir assets para ela mesma.

---

### 5.3 Transferência não cria patrimônio

Uma transferência entre Wallets não aumenta nem diminui o patrimônio total do usuário.

Ela apenas altera a localização de um asset.

---

### 5.4 Transferência não deve contar como depósito em Goal

Por padrão, uma transferência entre Wallets não é elegível para metas de depósito.

---

## 6. Regras de ajustes

### 6.1 Ajuste representa correção de saldo ou posição

Uma operação de ajuste deve existir para corrigir diferenças entre o estado registrado e a realidade.

Todo ajuste deve gerar uma Transaction.

---

### 6.2 Ajuste deve preservar rastreabilidade

Um ajuste deve possuir informação suficiente para identificar que não representa um depósito, retirada ou transferência comum.

Sempre que aplicável, deve possuir descrição ou motivo.

---

## 7. Regras de Assets e valores

### 7.1 Toda Transaction financeira envolvendo uma Wallet deve identificar o asset movimentado

Uma Transaction não pode movimentar um valor de Wallet sem identificar qual asset foi movimentado.

---

### 7.2 Quantidade do asset e valor em USD são informações distintas

Uma Transaction pode possuir:

```text
assetQuantity
usdValue
```

Esses valores representam conceitos diferentes.

Exemplo:

```text
asset: BTC
assetQuantity: 0.0015
usdValue: 150
```

---

### 7.3 Conversão em USD deve ser preservada historicamente

O valor em USD registrado em uma Transaction representa o valor da operação no contexto em que ela foi registrada.

Uma mudança posterior na cotação do asset não deve alterar automaticamente o valor histórico da Transaction.

---

### 7.4 Dados históricos não dependem exclusivamente da API externa

Uma Transaction deve armazenar referências suficientes do asset utilizado para continuar compreensível mesmo se:

- a API externa estiver indisponível;
- o asset deixar de ser retornado;
- informações do catálogo externo forem alteradas.

---

## 8. Regras de Goal

### 8.1 Goal não movimenta dinheiro

Uma Goal nunca cria depósitos, retiradas ou qualquer outra Transaction.

Ela apenas observa Transactions existentes.

---

### 8.2 Goal pode utilizar uma ou várias Wallets

Uma Goal pode estar associada a múltiplas Wallets.

Cada associação pode possuir sua própria configuração de meta.

---

### 8.3 Uma Wallet pode participar de múltiplas Goals

A participação em uma Goal não impede a mesma Wallet de participar de outra.

---

### 8.4 Apenas Transactions elegíveis contam para uma Goal

Uma Transaction só pode contribuir para uma Goal quando cumprir as regras de elegibilidade.

Entre elas:

- pertencer ao mesmo User;
- envolver uma Wallet participante da Goal;
- ocorrer dentro do período da Goal;
- possuir o sinalizador de elegibilidade habilitado;
- representar uma operação permitida para progresso.

---

### 8.5 Nem todo depósito deve contar para uma Goal

O fato de uma Transaction aumentar o patrimônio de uma Wallet não significa automaticamente que ela contribui para uma meta.

A elegibilidade deve ser registrada explicitamente na Transaction.

---

### 8.6 Transferências não contam como novos depósitos

Transferências entre Wallets do mesmo usuário não devem aumentar o progresso de uma Goal.

---

### 8.7 Progresso é derivado das Transactions elegíveis

Enquanto uma Goal estiver ativa, seu progresso deve ser calculado a partir das Transactions que atendem às suas regras.

A Goal não deve manter uma lista independente de depósitos ativos como fonte da verdade.

---

### 8.8 Goal arquivada possui snapshot imutável

Ao arquivar uma Goal, o sistema deve:

1. calcular seu progresso final;
2. gerar o snapshot;
3. registrar a data de arquivamento;
4. impedir novas alterações no progresso histórico da Goal.

O snapshot representa o resultado histórico daquela meta.

---

### 8.9 Goal arquivada não aceita novas configurações

Uma Goal arquivada não pode receber:

- novas Wallets;
- alterações de período;
- alterações de metas;
- novos cálculos ativos.

---

## 9. Regras de User e autenticação

### 9.1 Clerk é responsável pela autenticação

O Clerk é responsável por operações de autenticação, incluindo:

- login;
- logout;
- senha;
- recuperação de senha;
- gerenciamento de sessão.

---

### 9.2 APM SYN mantém apenas dados próprios da aplicação

O sistema não deve duplicar desnecessariamente informações cuja fonte de verdade é o Clerk.

O perfil interno deve manter apenas os dados necessários ao domínio do APM SYN e a referência ao usuário autenticado.

---

### 9.3 Sincronização do perfil deve utilizar o identificador do Clerk

O relacionamento entre a conta autenticada e os dados internos do APM SYN deve utilizar um identificador estável fornecido pelo Clerk.

---

### 9.4 Exclusão da conta deve considerar todos os dados do usuário

A exclusão definitiva da conta deve considerar:

- dados do perfil;
- Wallets;
- Websites;
- Transactions;
- Goals;
- snapshots e dados derivados pertencentes ao usuário.

A operação deve seguir uma estratégia explícita para evitar dados órfãos.

---

## 10. Regras de integridade e histórico

### 10.1 Histórico financeiro deve ser preservado

O sistema deve priorizar arquivamento ou desativação quando a exclusão puder comprometer a compreensão do histórico financeiro.

---

### 10.2 Dados derivados devem poder ser reconstruídos

Sempre que possível, saldos, posições e progresso devem poder ser reconstruídos a partir das Transactions e das regras do domínio.

---

### 10.3 Nenhuma operação pode gerar patrimônio duplicado

Uma mesma movimentação não pode ser registrada como múltiplos ganhos independentes apenas porque afeta diferentes áreas da interface.

Uma retirada de Website, por exemplo, é um único evento financeiro:

```text
WEBSITE → WALLET
```

Ela reduz o saldo do Website e aumenta a posição correspondente na Wallet sem criar patrimônio adicional.

---

### 10.4 O sistema deve preservar a origem de cada movimentação

Toda movimentação deve permitir identificar sua origem conceitual.

Exemplos:

```text
EXTERNAL → WALLET
WEBSITE → WALLET
WALLET → WALLET
WALLET → EXTERNAL
```

---

## 11. Regra central do APM SYN

O APM SYN não deve exigir que o usuário repita manualmente em diferentes módulos os efeitos de uma única operação financeira.

Uma única operação deve ser registrada uma única vez e seus efeitos devem ser refletidos automaticamente nas áreas relevantes do sistema.

```text
Uma operação
      ↓
Uma Transaction
      ↓
Múltiplas consequências sincronizadas
```

Esse é o princípio que diferencia o APM SYN do APM Lite.
