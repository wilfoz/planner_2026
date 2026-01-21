# LT - PLANNER

Sistema para planejamento e orçamento de Linhas de Transmissão (LT), composto por uma API robusta em NestJS e um Frontend moderno em Angular.

## Estrutura do Projeto

O projeto é dividido em dois diretórios principais:

- **backend/**: API RESTful construída com NestJS, Fastify e Prisma ORM.
- **frontend/**: Aplicação web desenvolvida com Angular (v20+), TailwindCSS e visualização de mapas com Deck.gl/Mapbox as of 2026.

---

## Backend (API)

### Tecnologias
- **Framework**: NestJS (com Fastify)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Docs**: Swagger (OpenAPI)
- **Arquitetura**: DDD / Clean Architecture

### Configuração e Execução

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Certifique-se de ter um arquivo `.env` ou `.env.development` configurado com a URL do banco de dados (DATABASE_URL).

4. Configuração do Banco de Dados:
   ```bash
   # Gerar cliente Prisma
   npm run prisma:generate

   # Executar migrações
   npm run prisma:migrate
   ```

5. Executar a aplicação:
   ```bash
   # Modo Desenvolvimento (com watch)
   npm run start:dev

   # Modo Produção
   npm run start:prod
   ```

   A API estará rodando geralmente em `http://localhost:3000` (ou porta configurada).
   A documentação Swagger pode ser acessada em `/api` ou rota similar (verifique o `main.ts`).

### Testes
   ```bash
   npm run test        # Unitários
   npm run test:e2e    # Ponta a ponta
   ```

---

## Frontend (Web App)

### Tecnologias
- **Framework**: Angular 18+ (v20.3.0)
- **Estilização**: TailwindCSS v4
- **Mapas**: Deck.gl, Mapbox GL, Lucide Icons
- **Mock Server**: JSON Server

### Configuração e Execução

1. Navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Executar a aplicação:
   ```bash
   npm start
   # ou
   ng serve
   ```
   Acesse a aplicação em `http://localhost:4200`.

4. Executar servidor de Mock (para dados falsos/testes):
   ```bash
   npm run mock
   ```
   O Mock server rodará em `http://localhost:3001`.

---

## Funcionalidades Principais

- **Gestão de Obras**: Cadastro e listagem de obras de transmissão.
- **Visualização 3D**: Renderização de torres e cabos em mapas interativos usando Deck.gl.
- **Orçamentação**: Ferramentas para cálculo e gestão de budget.
- **Microinterações**: Interface rica e responsiva com TailwindCSS.

## Requisitos

- Node.js (v20+ recomendado)
- PostgreSQL (para o backend)
- Angular CLI (globalmente ou via npx)
