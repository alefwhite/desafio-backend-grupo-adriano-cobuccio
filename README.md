# 💰 Wallet API - Sistema de Carteira Digital

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  API RESTful para gerenciamento de carteiras digitais e transações financeiras construída com NestJS, Prisma, PostgreSQL e Docker.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#pré-requisitos">Pré-requisitos</a> •
  <a href="#instalação">Instalação</a> •
  <a href="#configuração">Configuração</a> •
  <a href="#execução">Execução</a> •
  <a href="#testes">Testes</a> •
  <a href="#documentação-api">Documentação</a> •
  <a href="#docker">Docker</a>
</p>

---

## 📋 Features

### ✅ Funcionalidades Implementadas

- 🔐 **Autenticação JWT** - Sistema completo de autenticação com tokens
- 👤 **Gerenciamento de Usuários** - Criação e gerenciamento de contas
- 💳 **Carteiras Digitais** - Carteira automática para cada usuário
- 💸 **Transações** - Transferências entre carteiras com validações
- 🔄 **Estornos** - Sistema de reversão de transações
- 🔒 **Idempotência** - Prevenção de transações duplicadas
- 📊 **Métricas Prometheus** - Monitoramento da aplicação
- 📈 **Grafana Dashboard** - Visualização de métricas
- 📚 **Documentação Swagger** - API totalmente documentada
- ✅ **Testes Unitários** - 42 testes (100% passando)
- 🐳 **Docker** - Containerização completa

### 🔐 Segurança

- ✅ Hashing de senhas com bcrypt
- ✅ Autenticação JWT
- ✅ Guards de autorização
- ✅ Validação de dados com class-validator
- ✅ Helmet para segurança de headers HTTP
- ✅ CORS configurado
- ✅ Rate limiting com throttler

---

## 🚀 Tecnologias

### Core

- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript com tipagem estática
- **[Prisma](https://www.prisma.io/)** - ORM moderno para Node.js
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional

### Bibliotecas Principais

- **[@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt)** - Autenticação JWT
- **[@nestjs/swagger](https://www.npmjs.com/package/@nestjs/swagger)** - Documentação OpenAPI
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Hash de senhas
- **[class-validator](https://www.npmjs.com/package/class-validator)** - Validação de DTOs
- **[helmet](https://www.npmjs.com/package/helmet)** - Segurança HTTP

### Monitoramento

- **[Prometheus](https://prometheus.io/)** - Sistema de métricas
- **[Grafana](https://grafana.com/)** - Visualização de dados

### DevOps

- **[Docker](https://www.docker.com/)** - Containerização
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestração de containers

### Testes

- **[Jest](https://jestjs.io/)** - Framework de testes
- **[Supertest](https://www.npmjs.com/package/supertest)** - Testes E2E

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **[Node.js](https://nodejs.org/)** (versão 20 ou superior)
- **[pnpm](https://pnpm.io/)** (gerenciador de pacotes)
- **[Docker](https://www.docker.com/)** e **[Docker Compose](https://docs.docker.com/compose/)** (opcional, para rodar com containers)
- **[Git](https://git-scm.com/)**

### Verificar instalação:

```bash
node --version   # v20.x.x ou superior
pnpm --version   # 8.x.x ou superior
docker --version # 24.x.x ou superior
```

---

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/desafio-backend-grupo-adriano-cobuccio.git
cd desafio-backend-grupo-adriano-cobuccio
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://docker:docker@localhost:5432/bank?schema=public"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura-mude-isso"

# Application
PORT=3333
NODE_ENV=development
```

### Banco de Dados

#### Executar migrations:

```bash
pnpm prisma migrate dev
```

#### Gerar Prisma Client:

```bash
pnpm prisma generate
```

#### Abrir Prisma Studio (GUI para o banco):

```bash
pnpm prisma studio
```

---

## 🎯 Execução

### Modo Desenvolvimento

```bash
# Iniciar em modo watch (recarrega automaticamente)
pnpm run start:dev
```

A aplicação estará disponível em: **http://localhost:3333**

### Modo Produção

```bash
# Build da aplicação
pnpm run build

# Executar versão de produção
pnpm run start:prod
```

### Acessar Recursos

| Recurso | URL | Descrição |
|---------|-----|-----------|
| API | http://localhost:3333 | Endpoints da API |
| Swagger | http://localhost:3333/api/docs | Documentação interativa |
| Métricas | http://localhost:3333/metrics | Prometheus metrics |

---

## 🧪 Testes

### Executar todos os testes

```bash
pnpm test
```

### Testes em modo watch

```bash
pnpm test:watch
```

### Coverage de testes

```bash
pnpm test:cov
```

### Testes E2E

```bash
pnpm test:e2e
```

### Resultados dos Testes

```
Test Suites: 8 passed, 8 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        2.252 s
```

#### Cobertura de Testes

- ✅ **AuthService** (4 testes)
- ✅ **AuthController** (4 testes)
- ✅ **UsersService** (3 testes)
- ✅ **UsersController** (4 testes)
- ✅ **WalletsService** (3 testes)
- ✅ **WalletsController** (4 testes)
- ✅ **TransactionsService** (9 testes)
- ✅ **TransactionsController** (11 testes)

---

## 📚 Documentação API

### Swagger UI

Acesse a documentação interativa completa em:

```
http://localhost:3333/api/docs
```

### Endpoints Principais

#### 🔐 Autenticação

```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 👤 Usuários

```http
POST /users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

#### 💰 Depósito

```http
POST /wallets/deposits
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100.50
}
```

#### 💸 Transferência

```http
POST /transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "receiverUserId": "uuid-do-destinatario",
  "amount": 50.00,
  "idempotencyKey": "uuid-unico",
  "description": "Pagamento teste"
}
```

#### 🔄 Estorno

```http
POST /transactions/{id}/revert
Authorization: Bearer {token}
Content-Type: application/json

{
  "idempotencyKey": "uuid-unico-estorno"
}
```

### Autenticação

Para endpoints protegidos, inclua o header:

```
Authorization: Bearer {seu-token-jwt}
```

---

## 🐳 Docker

### Executar com Docker Compose

#### 1. Iniciar todos os serviços

```bash
docker-compose up -d
```

#### 2. Verificar logs

```bash
# Todos os serviços
docker-compose logs -f

# Apenas a aplicação
docker-compose logs -f app
```

#### 3. Executar migrations

```bash
docker-compose exec app pnpm prisma migrate deploy
```

#### 4. Parar os serviços

```bash
docker-compose down
```

#### 5. Rebuild limpo (em caso de problemas)

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Serviços Docker

| Serviço | Porta | URL | Credenciais |
|---------|-------|-----|-------------|
| App (NestJS) | 3333 | http://localhost:3333 | - |
| PostgreSQL | 5432 | localhost:5432 | docker/docker |
| Prometheus | 9090 | http://localhost:9090 | - |
| Grafana | 3001 | http://localhost:3001 | admin/admin |

---

## 📊 Monitoramento

### Prometheus

Acesse as métricas em:
```
http://localhost:9090
```

### Grafana

1. Acesse: http://localhost:3001
2. Login: `admin` / `admin`
3. Adicione data source: Prometheus (http://prometheus:9090)
4. Importe dashboards personalizados

### Métricas Disponíveis

```
http://localhost:3333/metrics
```

Exemplos de métricas expostas:
- `nodejs_version_info` - Informações da versão Node.js
- `process_cpu_user_seconds_total` - Uso de CPU
- `process_resident_memory_bytes` - Uso de memória
- `http_requests_total` - Total de requisições HTTP

---

## 🗂️ Estrutura do Projeto

```
src/
├── modules/
│   ├── auth/                 # Autenticação e autorização
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts
│   │   └── dto/
│   ├── users/                # Gerenciamento de usuários
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   ├── wallets/              # Carteiras digitais
│   │   ├── wallets.controller.ts
│   │   ├── wallets.service.ts
│   │   └── dto/
│   └── transactions/         # Transações financeiras
│       ├── transactions.controller.ts
│       ├── transactions.service.ts
│       └── dto/
├── shared/
│   ├── config/               # Configurações
│   ├── database/             # Prisma e repositórios
│   │   ├── prisma.service.ts
│   │   ├── unit-of-work.ts
│   │   └── repositories/
│   ├── decorators/           # Decorators customizados
│   └── controllers/          # Controllers compartilhados
├── app.module.ts             # Módulo principal
└── main.ts                   # Bootstrap da aplicação

prisma/
├── schema.prisma             # Schema do banco de dados
└── migrations/               # Migrations

docs/
├── TESTS_DOCUMENTATION.md    # Documentação dos testes
├── SWAGGER_DOCUMENTATION.md  # Documentação da API
├── DOCKER_SETUP.md           # Setup do Docker
└── PROMETHEUS_PUBLIC_ROUTE.md # Configuração Prometheus
```

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run start:dev          # Modo desenvolvimento com watch

# Build
pnpm run build              # Compilar TypeScript

# Produção
pnpm run start:prod         # Executar versão compilada

# Testes
pnpm test                   # Executar testes unitários
pnpm test:watch             # Testes em modo watch
pnpm test:cov               # Coverage de testes
pnpm test:e2e               # Testes end-to-end

# Database
pnpm prisma migrate dev     # Criar migration
pnpm prisma migrate deploy  # Aplicar migrations
pnpm prisma generate        # Gerar Prisma Client
pnpm prisma studio          # Abrir GUI do banco

# Linting
pnpm run lint               # Executar ESLint
pnpm run format             # Formatar código com Prettier
```

---

## 🔒 Segurança

### Práticas Implementadas

- ✅ Senhas hasheadas com bcrypt (salt rounds: 12)
- ✅ Tokens JWT com expiração
- ✅ Validação de entrada com class-validator
- ✅ Sanitização de dados
- ✅ Headers de segurança com Helmet
- ✅ CORS configurado
- ✅ Rate limiting (10 requests/minuto)
- ✅ Idempotência em transações
- ✅ Transações atômicas com Prisma

### Recomendações para Produção

- 🔐 Use variáveis de ambiente para secrets
- 🔐 Configure HTTPS/TLS
- 🔐 Implemente rate limiting por IP
- 🔐 Configure WAF (Web Application Firewall)
- 🔐 Monitore logs de segurança
- 🔐 Mantenha dependências atualizadas
- 🔐 Implemente 2FA para usuários admin

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Alef White**

- GitHub: [AlefWhite](https://github.com/alefwhite)

