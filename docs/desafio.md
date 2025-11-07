## Objetivo

Crie uma **carteira financeira** simples onde usuários podem transferir saldo entre si.
Há **apenas um tipo de usuário** — qualquer usuário pode **enviar** e **receber** dinheiro de qualquer outro usuário.

---

## Requisitos funcionais (obrigatórios)

1. **Cadastro**

    * Endpoint/fluxo para registrar um usuário com `nome`, `email` e `senha` (ou campos equivalentes).
2. **Autenticação**

    * Login com `email` + `senha` que retorna credenciais de sessão (token JWT, por exemplo).
3. **Transferência**

    * Usuários autenticados podem **enviar** saldo a outro usuário especificando `destinatario_id` e `valor`.
    * Usuários podem **receber** saldo (efeito da transferência no saldo do destinatário).
4. **Validação de saldo**

    * Antes de autorizar a transferência, o sistema deve verificar se o enviador tem saldo suficiente.
    * Transferências com valor `<= 0` ou inválido devem ser rejeitadas.
5. **Transações atômicas e reversão**

    * A operação de transferência deve ser executada dentro de uma **transação atômica** (ou equivalente) para garantir consistência.
    * Deve existir um mecanismo para **reversão** (roll back) em caso de inconsistência ou por solicitação do usuário (ex.: estorno manual via endpoint).
6. **Registro de operações**

    * Toda transferência deve gerar um registro (extrato) com: `id`, `de_user_id`, `para_user_id`, `valor`, `status` (`completada`, `pendente`, `estornada`, `falha`), `timestamp`, e `correlation_id`/`transaction_id`.

---

## Requisitos não-funcionais / de qualidade

* **Segurança**

    * Senhas nunca armazenadas em texto claro (hash seguro).
    * Endpoints protegidos (autenticação/autorization).
    * Evitar vazamento de dados sensíveis nas respostas e logs.
* **Consistência**

    * Evitar condições de corrida (race conditions) em cenários concorrentes.
* **Auditabilidade**

    * Logs/registro de eventos que permitam auditoria (quem fez o quê e quando).
* **Testabilidade**

    * API/serviço deve ser testável: incluir testes unitários e de integração cobrindo fluxos principais.
* **Design**

    * Aplicar bons princípios (SOLID, separation of concerns).
    * Usar padrões apropriados quando fizer sentido (Repository, Unit of Work/Transaction, Service Layer, DTOs).

---

## Modelagem de dados sugerida (exemplo mínimo)

```sql
-- Modelo baseado em `prisma/schema.prisma` (mapeamento de nomes e tipos Prisma -> SQL/ER)

users (tabela: `users`)
- id: uuid (Prisma: String @id @default(uuid()))
- name: string
- email: string (único)
- password: string (armazenar hash, campo Prisma: `password`)
- created_at: timestamp (Prisma: `createdAt`)
- updated_at: timestamp (Prisma: `updatedAt`)

wallets (tabela: `wallets`)
- id: uuid (Prisma: String @id @default(uuid()))
- user_id: uuid (Prisma: `userId`) - UNIQUE, FK -> users.id
- balance: decimal (Prisma: Decimal, default 0.00)
- created_at: timestamp
- updated_at: timestamp

transactions (tabela: `transactions`)
- id: uuid (Prisma: String @id @default(uuid()))
- sender_wallet_id: uuid (Prisma: `senderWalletId`) - FK -> wallets.id
- receiver_wallet_id: uuid (Prisma: `receiverWalletId`) - FK -> wallets.id
- amount: decimal (Prisma: Decimal)
- status: enum (Prisma enum `TransactionStatus`) -> POSSÍVEIS VALORES: PENDING, COMPLETED, FAILED, REVERSED (default: PENDING)
- description: string? (opcional/nullable)
- created_at: timestamp
- completed_at: timestamp? (nullable)

-- Observações importantes:
-- 1) O projeto usa `Decimal` para valores monetários (evitar erros de precisão). Você pode optar por armazenar centavos como integer, mas o schema atual usa Decimal.
-- 2) `wallets.user_id` é unique: cada usuário tem no máximo uma carteira ligada.
-- 3) A relação entre `Wallet` e `Transaction` é feita via `SentTransactions` e `ReceivedTransactions` no Prisma (cada Transaction referencia sender e receiver wallets).
-- 4) O schema Prisma atual não contém `correlation_id`/`transaction_id` além do `id` da transação; se desejar rastreabilidade extra (correlation_id) adicione o campo `correlation_id String?` em `Transaction`.
-- 5) Campos mapeados no Prisma usam snake_case no banco via `@map(...)` (ex.: `createdAt` -> `created_at`).
```

---

## Endpoints / Operações mínimas sugeridas

* `POST /signup` — cria usuário.
* `POST /login` — autentica e retorna token.
* `GET /me` — retorna dados do usuário autenticado e saldo atual.
* `POST /transfer` — inicia transferência `{ to_user_id, amount }`.
* `POST /transfer/{transaction_id}/reverse` — solicita reversão/estorno de uma transferência (restrições aplicáveis).
* `GET /transactions` — lista/extrato de transações do usuário (filtros por status, data).

> Observação: o design dos endpoints pode variar (gRPC, RPC, etc.), desde que cumpra os requisitos.

---

## Critérios de aceitação (o que deve ser entregue para o teste)

1. Código fonte com a implementação dos requisitos funcionais.
2. Rotas/endpoints funcionando conforme descrito.
3. Banco de dados (migrations/schema) e scripts de seed para testes (ex.: criar 2 usuários com saldo inicial).
4. Testes automatizados cobrindo:

    * Cadastro e autenticação.
    * Transferência bem-sucedida (saldo debitado e creditado corretamente).
    * Transferência falha por saldo insuficiente.
    * Reversão/estorno de transferência.
    * Condição de concorrência (ex.: duas transferências simultâneas que poderiam causar saldo negativo).
5. Instruções de como executar o projeto e os testes (`README` com comandos).
6. Breve justificativa escrita (1–2 páginas ou arquivo `JUSTIFICATION.md`) explicando:

    * Principais decisões arquiteturais.
    * Padrões usados.
    * Como a solução garante segurança e consistência.
    * Possíveis melhorias/limitações conhecidas.

---

## Cenários de teste / Casos de uso (exemplos)

1. **Happy path**

    * Usuário A (saldo 100) transfere 30 para Usuário B → A:70, B:30, transação `completed`.
2. **Saldo insuficiente**

    * Usuário A (saldo 10) tenta transferir 50 → retorno de erro (HTTP 400/402), nenhum saldo alterado.
3. **Valor inválido**

    * Transferência com `amount = 0` ou negativo → rejeitar, sem alteração.
4. **Reversão**

    * Após transferência `completed`, solicitam reversão → sistema cria transação de estorno (ou marca a original como `reversed`) e ajusta saldos.
5. **Concorrência**

    * Dois pedidos simultâneos de transferência que, somados, excedem o saldo → garantir que apenas operações autorizadas ocorram e saldos não fiquem negativos.
6. **Falha parcial**

    * Simular falha na etapa de gravação do destinatário após débito do remetente — sistema deve garantir rollback e consistência.

---

## Critérios de avaliação

* **Segurança:** tratamento de senhas, tokens, exposição de dados.
* **Consistência & Confiabilidade:** uso correto de transações, proteções contra race conditions.
* **Justificativa técnica:** capacidade de argumentar escolhas e trade-offs.
* **Conhecimento de padrões:** aplicação de SOLID e padrões quando apropriado.
* **Modelagem de dados:** clareza e adequação do modelo à necessidade.
* **Qualidade do código:** legibilidade, modularidade, testes e documentação.
* **Entrega completa:** README com instruções claras e testes automatizados executáveis.

---

## Restrições / Observações

* Não é necessário implementar formas de pagamento externas (PIX, cartão, etc.) — foco em transferências internas entre usuários.
* Saldo pode ser inteiro (centavos) ou decimal; defina e justifique a escolha (recomendado usar centavos/inteiro ou decimal com precisão adequada para evitar problemas de arredondamento).
* Performance e escalabilidade são consideradas, mas não obrigatórias — discutir como a solução poderia escalar é parte da avaliação.

---

## Entregáveis esperados

1. Repositório com o código (link ou zip).
2. `README.md` com passos para rodar localmente e executar testes.
3. Migrations/schema e seed.
4. Testes automatizados executáveis.
5. `JUSTIFICATION.md` com as decisões técnicas.

---

## Mensagem final (para o candidato)

Implemente a solução focando em **correção**, **consistência** e **segurança**. Explique claramente as decisões técnicas tomadas e inclua testes que demonstrem que as regras críticas (saldo, transações atômicas e reversões) funcionam corretamente. Boa sorte!
