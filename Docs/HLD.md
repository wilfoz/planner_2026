# High-Level Design (HLD) - Planner

## 1. Visão Geral e Objetivos
**Produto:** Planner - Sistema de Controle de Produções em Obras de Linhas de Transmissão.
**Objetivo:** Substituir controles descentralizados em Excel por um sistema centralizado, robusto e visual para gestão de obras, reduzindo erros de lançamento e provendo visibilidade em tempo real.

## 2. Arquitetura do Sistema

O sistema segue uma arquitetura **Monolítica Modular** dividida em Frontend e Backend, comunicando-se via API REST.

### Diagrama de Contexto (C4 Level 1)
```mermaid
graph LR
    User[Usuário (Gerente/Colaborador)] -- HTTPS/JSON --> Frontend[Frontend (Angular)]
    Frontend -- HTTPS/REST --> Backend[Backend (NestJS)]
    Backend -- TCP --> DB[(PostgreSQL)]
    Frontend -- Tiles/Assets --> Mapbox[Mapbox/Deck.gl API]
```

## 3. Componentes e Responsabilidades

### 3.1 Frontend (SPA)
*   **Tecnologia:** Angular 18+ (Standalone Components), Tailwind CSS.
*   **Responsabilidade:** Interface do usuário, renderização do mapa 3D, gestão de estado (Signals), validações de formulário (Reactive Forms).
*   **Gestão de Contexto:** O sistema impõe que uma Obra (Work) esteja selecionada para permitir acesso às funcionalidades de Torres, Produções e Mapa. O estado da obra selecionada é persistido.
*   **Módulos Principais:**
    *   `MapModule`: Integração com Mapbox GL e Deck.gl para visualização 3D.
    *   `ProductionModule`: Formulários de lançamento e listagens.
    *   `DashboardModule`: Visualização de métricas e gráficos.
    *   `AuthModule`: Login e gestão de sessão.

### 3.2 Backend (API)
*   **Tecnologia:** NestJS, Prisma ORM.
*   **Responsabilidade:** Regras de negócio, persistência de dados, autenticação, validação de dados, processamento de planilhas.
*   **Módulos (Contextos DDD):**
    *   `Works`: Gestão de obras.
    *   `Towers`: Gestão de torres e coordenadas.
    *   `Productions`: Lançamento e cálculo de avanço.
    *   `Users/Auth`: Gestão de usuários e permissões.

### 3.3 Banco de Dados
*   **Tecnologia:** PostgreSQL.
*   **Responsabilidade:** Armazenamento relacional de dados com integridade referencial.
*   ** Dados Críticos:** Obras, Torres (com coordenadas geográficas), Produções, Equipes.

## 4. Fluxo de Dados Principal

1.  **Requisição:** O Frontend envia requisições HTTP (GET/POST/PUT/DELETE) para o Backend.
2.  **Verificação de Contexto:** O Frontend verifica se há uma Obra Selecionada (Local Storage/Signal) para rotas protegidas pelo `WorkGuard`.
3.  **Autenticação:** O Backend valida o token JWT no Guard de autenticação.
3.  **Processamento:** O Controller encaminha para o Service/UseCase correspondente.
4.  **Persistência:** O Service utiliza o Prisma Repository para interagir com o PostgreSQL.
5.  **Resposta:** O Backend retorna DTOs padronizados (JSON) para o Frontend.

## 5. Integrações Externas

*   **Mapbox GL:** Provedor de mapas base (tiles satélite/ruas) e dados de relevo (Terrain-DEM).
*   **Deck.gl:** Framework de visualização de dados WebGL massivos, utilizado para renderizar torres (modelos 3D GLTF) e cabos (linhas) sobre o mapa base.

## 6. Considerações Não-Funcionais

### 6.1 Segurança
*   Autenticação via JWT (Json Web Token).
*   Senhas hashadas com Bcrypt.
*   CORS configurado para permitir apenas origens confiáveis.

### 6.2 Escalabilidade e Performance
*   Backend stateless facilitando escala horizontal (futuro).
*   Renderização 3D otimizada no client-side (Frontend) usando WebGL.
*   Paginação em todos os endpoints de listagem.

### 6.3 Observabilidade
*   Logs estruturados no Backend (NestJS Logger).
*   Tratamento global de exceções (Exception Filters).

## 7. Infraestrutura
*   **Containerização:** Docker e Docker Compose para padronização de ambientes (Dev/Prod).
*   **CI/CD:** Pipelines para build, testes e deploy automáticos (planejado).

## 8. Riscos Identificados
*   **Desempenho no Mapa:** Renderizar milhares de torres pode ser pesado. *Mitigação:* Usar LOD (Level of Detail) e lazy loading se necessário.
*   **Custo de APIs:** Mapbox cobra por load. *Mitigação:* Cache de tiles e otimização de requisições.
