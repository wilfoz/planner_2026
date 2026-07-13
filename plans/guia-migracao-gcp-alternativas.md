# Guia de Migração — Alternativas de Melhor Custo-Benefício ao Google Cloud (GCP)

> **Projeto:** LT-PLANNER — Sistema de planejamento e orçamento de Linhas de Transmissão
> **Data:** Julho/2026 (rev. 2 — Opção A detalhada)
> **Escopo:** Avaliar alternativas ao GCP para hospedar 100% das funcionalidades existentes, com plano de implementação detalhado da opção recomendada (Opção A) e lista explícita dos serviços que ficam de fora em cada opção.
> **Nota sobre preços:** valores em USD/mês, aproximados (planos e preços mudam — confirme nos sites oficiais antes de contratar).

---

## 1. Inventário de funcionalidades existentes (o que a nuvem precisa suportar)

Levantamento feito diretamente do código do repositório:

### Backend (`backend/`)
| Funcionalidade | Implementação | Requisito de infraestrutura |
|---|---|---|
| API REST | NestJS 11 + Fastify | Runtime Node.js 20+ (container ou PaaS) |
| Banco de dados | PostgreSQL + Prisma ORM (10 modelos: User, Work, Tower, Foundation, Task, Team, Equipment, Employee, Production) | PostgreSQL 16 gerenciado ou auto-hospedado |
| Migrações e seed | `prisma migrate deploy` + `seed.ts` | Acesso ao banco no deploy/CI |
| Autenticação | JWT (`@nestjs/jwt`) + bcryptjs | Variáveis de ambiente/segredos (JWT secret) |
| Documentação | Swagger em `GET /api` | Nenhum extra (servido pela própria API) |
| Configuração | `EnvConfigService` lê `APP_PORT`, `NODE_ENV`, `JWT_SECRET`, `JWT_EXPIRES_IN_SECONDS`; Prisma lê `DATABASE_URL` | Gestão de segredos |
| Contextos de negócio | works, towers, foundations, tasks, teams, equipments, employees, productions, users | CRUD via API — sem dependência de nuvem específica |

> **Detalhe de roteamento (importante para o deploy):** a API **não usa prefixo global** — as rotas ficam na raiz (`/tower`, `/production`, `/work`...). O frontend chama `${apiUrl}/tower` com `apiUrl = '/api'`, e em dev o `proxy.conf.json` encaminha `/api` para o mock. Em produção, o proxy/rewrite precisa **remover o prefixo `/api`** antes de encaminhar para a API (ex.: `/api/tower` → `https://<api>/tower`). A rota `/api` do backend é o Swagger, não a base da API.

### Frontend (`frontend/`)
| Funcionalidade | Implementação | Requisito de infraestrutura |
|---|---|---|
| SPA | Angular 20 (projeto `my-project`) + TailwindCSS 4 | Hospedagem estática + fallback de rotas para `index.html` |
| Mapa 3D (torres/cabos) | Deck.gl 9 + Mapbox GL 3 + glTF (`loaders.gl`) | **Mapbox é SaaS de terceiros** — independe da nuvem escolhida |
| Cache offline do mapa | Dexie (IndexedDB, no navegador) | Nenhum (client-side) |
| Importação/exportação de planilhas | `xlsx` (client-side, ex.: importação de torres) | Nenhum (client-side) |
| Proxy de API em dev | `proxy.conf.json` (`/api`) | Em produção: rewrite no CDN ou CORS |
| Mock server | json-server | Apenas dev — não vai para produção |

### DevOps
| Funcionalidade | Implementação | Requisito |
|---|---|---|
| CI | GitHub Actions (lint, testes, build de ambos) | Mantém-se igual em qualquer nuvem |
| Banco local | docker-compose (Postgres 16-alpine) | Apenas dev |

> ⚠️ **Achado de segurança (independente da migração):** o token do Mapbox está hardcoded em `frontend/src/app/environments/environment.ts` e commitado no repositório. Antes de qualquer deploy público, rotacione o token no painel do Mapbox e aplique **restrição por URL/domínio** ao novo token.

**Conclusão do inventário:** a aplicação é *cloud-agnostic* — não há nenhuma chamada a SDK/serviço proprietário do GCP no código. A migração é 100% de infraestrutura (hospedagem, banco, segredos, rede), sem alteração de código de negócio.

---

## 2. Arquitetura de referência no GCP (baseline de comparação)

| Necessidade | Serviço GCP | Custo estimado/mês (carga pequena/média) |
|---|---|---|
| API NestJS | Cloud Run | US$ 5–40 (com min-instances=1: ~US$ 15–50) |
| PostgreSQL | Cloud SQL (db-f1-micro → db-custom-1-3840 + storage + HA) | **US$ 10–120** (HA dobra o valor) |
| Frontend estático | Firebase Hosting ou Cloud Storage + Cloud CDN + Load Balancer | US$ 0–25 (o LB sozinho custa ~US$ 18/mês) |
| Segredos | Secret Manager | ~US$ 1 |
| Imagens Docker | Artifact Registry | ~US$ 1 |
| Build/Deploy | Cloud Build | US$ 0–10 |
| Logs/Métricas | Cloud Logging + Monitoring | US$ 0–15 |
| WAF/DDoS | Cloud Armor | US$ 5–20 |
| **Total típico** | | **~US$ 40–200/mês** |

O maior peso é o **Cloud SQL** (instância 24/7 + storage + backup + HA) e o **Load Balancer fixo** — exatamente onde as alternativas abaixo economizam.

---

## 3. Alternativas avaliadas (resumo)

### Opção A — "Best-of-breed" serverless ⭐ RECOMENDADA — detalhada na seção 6

| Componente | Serviço | Custo/mês |
|---|---|---|
| Frontend Angular | **Cloudflare Pages** (free: CDN global, SSL, Pages Functions p/ proxy da API) | **US$ 0** |
| API NestJS | **Fly.io** (container, região `gru`/São Paulo) | **US$ 3–10** |
| PostgreSQL | **Neon** (Postgres serverless, região `sa-east-1`/São Paulo) | **US$ 0–19** |
| Segredos | `fly secrets` + GitHub Secrets | US$ 0 |
| CI/CD | GitHub Actions (já existe) | US$ 0 |
| **Total** | | **US$ 3–30/mês** |

### Opção B — PaaS único (mais simples de operar)

| Fornecedor | Frontend | API | Postgres | Custo/mês |
|---|---|---|---|---|
| **Render** | Static Site (free) | Web Service US$ 7 | Postgres US$ 6–20 | **US$ 13–30** |
| **Railway** | Static/serviço | Por uso (~US$ 5–10) | Por uso (~US$ 5–15) | **US$ 10–25** |
| **DigitalOcean App Platform** | Static (3 grátis) | App US$ 5–12 | Managed PG US$ 15+ | **US$ 20–30** |

**Prós:** um só painel/faturamento, deploy por push nativo. **Contras:** mais caro que a A no médio prazo; Postgres com menos recursos nos planos baratos.

### Opção C — VPS auto-gerenciado (menor custo absoluto, mais responsabilidade)

Hetzner CX22 (~US$ 4–8) + Coolify/Dokploy (free) + Postgres em container + Cloudflare free na frente ≈ **US$ 5–12/mês**. Custo imbatível, mas **você vira o SRE** (patching, hardening, backup testado, disponibilidade, sem SLA).

---

## 4. Tabela de-para: GCP → Alternativas

| Serviço GCP | Opção A (best-of-breed) | Opção B (Render) | Opção C (Hetzner) |
|---|---|---|---|
| Cloud Run | Fly.io | Render Web Service | Docker + Coolify |
| Cloud SQL (Postgres) | Neon | Render Postgres | Postgres em container |
| Firebase Hosting / GCS+CDN | Cloudflare Pages | Render Static Site | Caddy/Nginx + Cloudflare |
| Cloud Load Balancing | Incluído (Fly proxy / CF) | Incluído | Caddy/Nginx |
| Secret Manager | Fly secrets | Render env groups | Coolify secrets |
| Artifact Registry | Registry do Fly / GHCR (grátis) | Build nativo do Render | GHCR (grátis) |
| Cloud Build | GitHub Actions (já existente) | Deploy nativo por push | GitHub Actions + webhook |
| Cloud Logging | Logs do Fly (retenção curta) + Better Stack/Axiom (free) | Logs do Render | Dozzle/Loki |
| Cloud Monitoring / Uptime | Better Stack / UptimeRobot (free) | Render metrics + UptimeRobot | Netdata + UptimeRobot |
| Cloud Armor (WAF) | Cloudflare Free (WAF básico) | — *(sem equivalente)* | Cloudflare Free + fail2ban |
| Cloud DNS | Cloudflare DNS (free) | Cloudflare DNS | Cloudflare DNS |
| Cloud Scheduler | GitHub Actions cron / Fly cron | Render Cron Jobs | cron do Linux |
| IAM (contas de serviço) | Tokens por app (menos granular) | Times/roles do Render | Usuários Linux/SSH |

---

## 5. Serviços que FICAM DE FORA (sem equivalente direto)

Hoje o LT-PLANNER **não usa nada disto no código**, então a perda é de *capacidade futura*, não de funcionalidade atual:

| Serviço GCP sem equivalente | Impacto para o LT-PLANNER | Mitigação se precisar no futuro |
|---|---|---|
| **BigQuery** (data warehouse) | Nenhum hoje | ClickHouse Cloud, DuckDB/MotherDuck, ou o próprio Postgres até dezenas de GB |
| **Pub/Sub** (mensageria gerenciada) | Nenhum hoje (não há filas/eventos) | Redis/BullMQ, ou Upstash (free tier) |
| **Vertex AI / Gemini na plataforma** | Nenhum hoje | APIs diretas (Anthropic/OpenAI) independem da nuvem |
| **VPC Service Controls / IAM ultra-granular** | Baixo — app pequeno, um time | Segredos por serviço, 2FA nos painéis |
| **Cloud Armor avançado** (WAF customizado, rate-limit L7) | Baixo | Cloudflare Pro (US$ 20) se sofrer ataques reais |
| **Cloud Spanner / AlloyDB** | Nenhum — Postgres comum atende com sobra | — |
| **SLA corporativo unificado + suporte 24/7** | Fly/Neon/CF têm SLAs menores nos planos baratos | Aceitar o risco (uso interno) ou plano pago com SLA |
| **Multi-região automática com failover** | Nenhum hoje (single-region basta) | Neon tem réplicas; Fly roda multi-região com config manual |
| **Cloud Trace / Profiler (APM nativo)** | Baixo | OpenTelemetry + Grafana Cloud free tier |

**O que NÃO fica de fora em nenhuma opção:** API NestJS completa (9 contextos), Postgres/Prisma com migrações e seed, JWT, Swagger, SPA Angular com mapa 3D Deck.gl/Mapbox, importação xlsx, cache offline Dexie, CI no GitHub Actions. **Mapbox continua funcionando identicamente — é contratado à parte da nuvem.**

---

## 6. IMPLEMENTAÇÃO DETALHADA — Opção A

### 6.1 Arquitetura alvo

```
                        ┌─────────────────────────────────────────┐
 Usuário ──HTTPS──►     │  Cloudflare (DNS + CDN + SSL, free)     │
                        │                                         │
                        │  Pages: SPA Angular (dist/my-project)   │
                        │   ├── /            → index.html (SPA)   │
                        │   └── /api/*       → Pages Function     │
                        │                       (proxy, remove    │
                        │                        prefixo /api)    │
                        └───────────────┬─────────────────────────┘
                                        │ HTTPS
                        ┌───────────────▼─────────────────────────┐
                        │  Fly.io — região gru (São Paulo)        │
                        │  Container NestJS/Fastify :3000         │
                        │  Secrets: DATABASE_URL, JWT_SECRET...   │
                        └───────────────┬─────────────────────────┘
                                        │ TLS (pooler PgBouncer)
                        ┌───────────────▼─────────────────────────┐
                        │  Neon — Postgres 16 serverless          │
                        │  região sa-east-1 (São Paulo)           │
                        │  branch main + branch dev (grátis)      │
                        └─────────────────────────────────────────┘

 GitHub Actions: CI existente + jobs de migração (prisma migrate deploy)
                 e deploy (flyctl deploy). Pages faz deploy por push sozinho.
```

**Por que esta combinação:**
- **Zero mudança de código de negócio.** Neon é Postgres real (Prisma só troca a `DATABASE_URL`); Fly roda o container como está; o `apiUrl: '/api'` do frontend continua válido porque a Pages Function reproduz em produção o mesmo papel do `proxy.conf.json` de dev — **sem CORS** (hoje o backend não configura CORS, e assim não precisa).
- **Latência:** Fly `gru` + Neon `sa-east-1` ficam ambos em São Paulo; Cloudflare tem POPs no Brasil.
- **Custo:** só a máquina do Fly é paga desde o início (~US$ 3–6); Pages e Neon começam grátis.

### 6.2 Pré-requisitos (Fase 0)

1. **Contas:** Cloudflare (free), Fly.io (requer cartão), Neon (free). Ative 2FA nas três.
2. **CLIs locais:** `flyctl` (`curl -L https://fly.io/install.sh | sh`). Neon e Pages são configuráveis 100% pelo painel web.
3. **Rotacionar o token Mapbox** (painel Mapbox → novo token público com *URL restrictions* para o domínio de produção e `localhost`) e atualizar `environment.ts`/`environment.development.ts`.
4. **Criar o Dockerfile da API** — o `backend/Dockerfile` atual é só o Postgres de dev; não sobrescreva, crie por exemplo `backend/Dockerfile.api`:

```dockerfile
# backend/Dockerfile.api
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# --ignore-scripts: pula o postinstall (setup-env.js), que é só para dev local
RUN npm ci --ignore-scripts
COPY . .
RUN npm run prisma:generate && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

5. **Teste local do container** contra o Postgres do docker-compose:
```bash
cd backend
docker build -f Dockerfile.api -t lt-planner-api .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:docker@host.docker.internal:5432/lt-db?schema=public" \
  -e JWT_SECRET=dev-secret -e JWT_EXPIRES_IN_SECONDS=3600 -e APP_PORT=3000 \
  lt-planner-api
# valida: http://localhost:3000/api (Swagger)
```

> **Opcional recomendado:** adicionar um endpoint `GET /health` simples no NestJS (retorna 200) para os health checks do Fly e do UptimeRobot. Enquanto não existir, use `GET /api` (Swagger, retorna 200) como rota de check.

### 6.3 Banco de dados — Neon (Fase 1, ~1h)

1. **Criar o projeto:** painel Neon → *New Project* → nome `lt-planner`, Postgres 16, região **AWS sa-east-1 (São Paulo)**.
2. **Entender as duas connection strings** (painel → *Connection Details*):
   - **Pooled** (host com `-pooler`): para a **aplicação** (PgBouncer, aguenta muitas conexões).
   - **Direct** (sem `-pooler`): para **migrações** (`prisma migrate` não funciona bem via pooler em transaction mode).
3. **Formato para o Prisma:**
   ```
   # runtime (Fly secret DATABASE_URL)
   postgresql://<user>:<senha>@<host>-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15

   # migrações (GitHub Secret NEON_DIRECT_URL)
   postgresql://<user>:<senha>@<host>.sa-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   O parâmetro `pgbouncer=true` faz o Prisma desativar prepared statements (obrigatório atrás do PgBouncer em transaction mode).
4. **Aplicar o schema:**
   ```bash
   cd backend
   DATABASE_URL="<NEON_DIRECT_URL>" npm run prisma:migrate:deploy
   ```
5. **Migrar dados** (se já existir produção em outro lugar; pule se for ambiente novo):
   ```bash
   pg_dump --no-owner --no-acl "<DATABASE_URL_ORIGEM>" > dump.sql
   psql "<NEON_DIRECT_URL>" < dump.sql
   ```
   Validar: contagem de linhas das 10 tabelas na origem × destino.
6. **Seed** (apenas ambiente novo): `DATABASE_URL="<NEON_DIRECT_URL>" npx prisma db seed --schema src/shared/infrastructure/database/prisma/schema.prisma`.
7. **Branch de desenvolvimento (grátis):** crie um branch `dev` no Neon — é uma cópia copy-on-write do banco para testar migrações sem tocar produção. Substitui o "clone de Cloud SQL" a custo zero.
8. **Comportamento do free tier:** o compute suspende após ~5 min de inatividade e religa em ~500ms–1s na primeira query. Aceitável para uso interno; o plano Launch (US$ 19) remove a suspensão e adiciona PITR de 7 dias — recomendado ao entrar em produção de verdade.

### 6.4 API — Fly.io (Fase 2, ~1–2h)

1. **Criar o app** (a partir de `backend/`):
   ```bash
   cd backend
   fly launch --no-deploy --name lt-planner-api --region gru --dockerfile Dockerfile.api
   ```
2. **Revisar o `fly.toml` gerado** — deixe assim:
   ```toml
   app = "lt-planner-api"
   primary_region = "gru"

   [build]
     dockerfile = "Dockerfile.api"

   [env]
     NODE_ENV = "production"
     APP_PORT = "3000"

   [http_service]
     internal_port = 3000
     force_https = true
     auto_stop_machines = "stop"    # desliga sem tráfego = economia
     auto_start_machines = true
     min_machines_running = 0       # troque para 1 p/ eliminar cold start (~US$ +3)

     [[http_service.checks]]
       interval = "30s"
       timeout = "5s"
       grace_period = "10s"
       method = "GET"
       path = "/api"                # Swagger responde 200; troque por /health se criar

   [[vm]]
     size = "shared-cpu-1x"
     memory = "512mb"
   ```
3. **Segredos** (nunca no fly.toml):
   ```bash
   fly secrets set \
     DATABASE_URL="<POOLED_URL_com_pgbouncer=true>" \
     JWT_SECRET="$(openssl rand -base64 48)" \
     JWT_EXPIRES_IN_SECONDS=3600
   ```
   > Se gerar um novo `JWT_SECRET`, todos os usuários precisarão logar de novo (tokens antigos invalidam) — irrelevante em migração com janela.
4. **Deploy e smoke test:**
   ```bash
   fly deploy
   fly status                                  # máquina "started" e check "passing"
   curl -s https://lt-planner-api.fly.dev/api  # Swagger HTML
   # login → token JWT → GET /work com Bearer token (CRUD de ponta a ponta)
   ```
5. **Escala/custo:** 1 máquina `shared-cpu-1x` 512 MB ≈ **US$ 3–6/mês** ligada 24/7 — e menos que isso com `auto_stop` ativo. Para tirar o cold start (~2–4s do boot do Node), use `min_machines_running = 1`. Para alta disponibilidade simples: `fly scale count 2` (duas máquinas em `gru`, o proxy do Fly faz o balanceamento — substitui o Cloud Load Balancer do GCP sem custo fixo).
6. **Logs:** `fly logs` (tempo real). Retenção é curta — se precisar de histórico, adicione um *log shipper* para Axiom/Better Stack (free tier) depois.

### 6.5 Frontend — Cloudflare Pages (Fase 3, ~1h)

1. **Criar o projeto:** painel Cloudflare → *Workers & Pages* → *Create* → *Pages* → conectar ao repositório GitHub `wilfoz/planner_2026`.
2. **Configuração de build:**
   | Campo | Valor |
   |---|---|
   | Production branch | `main` |
   | Root directory | `frontend` |
   | Build command | `npm run build -- --configuration production` |
   | Build output directory | `dist/my-project/browser` |
   | Variável de ambiente | `NODE_VERSION = 20` |
3. **Proxy `/api` → Fly (Pages Function).** Crie `frontend/functions/api/[[path]].js`:
   ```js
   // Reproduz em produção o papel do proxy.conf.json de dev:
   // /api/tower → https://lt-planner-api.fly.dev/tower (remove o prefixo /api,
   // pois a API NestJS não usa prefixo global)
   export async function onRequest({ request, params, env }) {
     const url = new URL(request.url);
     const path = Array.isArray(params.path) ? params.path.join('/') : (params.path ?? '');
     const target = `${env.API_ORIGIN}/${path}${url.search}`;
     return fetch(new Request(target, request));
   }
   ```
   E no painel do Pages → *Settings* → *Environment variables*: `API_ORIGIN = https://lt-planner-api.fly.dev` (production; aponte o preview para um app Fly de staging se criar um).
   > Com isso o frontend continua usando `apiUrl: '/api'` como hoje — **não é preciso configurar CORS no backend** nem criar `environment` de produção com URL absoluta.
   > Free tier de Functions: 100.000 requisições/dia — muito acima do necessário para uso interno. Só as chamadas `/api/*` contam; os assets estáticos são ilimitados.
4. **Fallback SPA:** o Pages detecta SPA automaticamente (sem `404.html` na raiz, qualquer rota desconhecida serve `index.html` com 200) — as rotas do Angular Router funcionam em refresh/deep-link sem configuração extra.
5. **Deploy:** salvar já dispara o primeiro build. Cada push na `main` publica produção; cada PR ganha um *preview deployment* com URL própria (útil para revisar telas).
6. **Smoke test:** abrir a URL `*.pages.dev` → login → listas (works/towers) → **mapa 3D** (valida o token Mapbox novo e o carregamento glTF) → importação de planilha xlsx → refresh numa rota interna (valida o fallback SPA).

### 6.6 Domínio, DNS e TLS (~30min)

1. Adicionar o domínio no Cloudflare (se ainda não estiver) — plano Free.
2. *Pages → Custom domains* → `planner.seudominio.com.br` (CNAME automático, certificado emitido em minutos).
3. A API **não precisa de domínio próprio** (só é acessada via Pages Function). Se quiser um mesmo assim (`api.seudominio.com.br`), use `fly certs add api.seudominio.com.br` + CNAME **DNS-only (nuvem cinza)** no Cloudflare, para não ter proxy duplo.
4. Benefício incluso do proxy Cloudflare: CDN, SSL, HTTP/3, WAF básico e proteção DDoS — cobre o papel do Cloud CDN + parte do Cloud Armor sem custo.

### 6.7 CI/CD — GitHub Actions (Fase 4, ~1h)

O `ci.yml` atual (lint/test/build) fica intocado. Adicione um workflow de deploy da API — o frontend o Pages já publica sozinho por push:

```yaml
# .github/workflows/deploy-api.yml
name: Deploy API

on:
  push:
    branches: [ main ]
    paths: [ 'backend/**' ]
  workflow_dispatch:

concurrency: deploy-api   # evita dois deploys simultâneos

jobs:
  migrate-and-deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install
        run: npm ci --ignore-scripts

      # Migra ANTES do deploy, usando a conexão DIRETA do Neon (sem pooler)
      - name: Prisma migrate deploy
        run: npx prisma migrate deploy --schema src/shared/infrastructure/database/prisma/schema.prisma
        env:
          DATABASE_URL: ${{ secrets.NEON_DIRECT_URL }}

      - uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Fly deploy
        run: flyctl deploy --remote-only --config fly.toml --dockerfile Dockerfile.api
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

**GitHub Secrets a criar** (repo → Settings → Secrets and variables → Actions):
| Secret | Valor | Origem |
|---|---|---|
| `NEON_DIRECT_URL` | connection string **direta** do Neon | painel Neon |
| `FLY_API_TOKEN` | `fly tokens create deploy -a lt-planner-api` | CLI do Fly (token escopado só neste app) |

> **Ordem segura:** migração roda antes do deploy; como `prisma migrate deploy` só aplica migrações pendentes, é idempotente. Para mudanças destrutivas de schema, use o padrão expand/contract (adicionar coluna → deploy → migrar dados → remover coluna em release seguinte).

### 6.8 Observabilidade e backup (Fase 5, ~1h)

1. **Uptime (free):** UptimeRobot ou Better Stack monitorando:
   - `https://planner.seudominio.com.br` (frontend)
   - `https://lt-planner-api.fly.dev/api` (API/Swagger — ou `/health` se criado)
   - Alertas por e-mail (wilerfoz@gmail.com) / Telegram.
2. **Backup lógico semanal** (defesa extra além do backup do Neon — o free tier tem retenção curta; o plano Launch tem PITR de 7 dias):
   ```yaml
   # .github/workflows/backup-db.yml
   name: Backup DB
   on:
     schedule: [ { cron: '0 6 * * 1' } ]   # segundas 03:00 BRT
     workflow_dispatch:
   jobs:
     dump:
       runs-on: ubuntu-latest
       steps:
         - name: pg_dump
           run: |
             sudo apt-get -yqq install postgresql-client
             pg_dump --no-owner --no-acl "$DATABASE_URL" | gzip > backup-$(date +%F).sql.gz
           env:
             DATABASE_URL: ${{ secrets.NEON_DIRECT_URL }}
         - name: Upload para R2 (S3-compatível)
           run: |
             pip -q install awscli
             aws s3 cp backup-*.sql.gz s3://lt-planner-backups/ --endpoint-url ${{ secrets.R2_ENDPOINT }}
           env:
             AWS_ACCESS_KEY_ID: ${{ secrets.R2_ACCESS_KEY_ID }}
             AWS_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET_ACCESS_KEY }}
   ```
   Bucket: **Cloudflare R2** (10 GB grátis, sem custo de egress). Crie o bucket `lt-planner-backups` + um API token S3 no painel do R2.
   **Teste o restore** uma vez (`psql` num branch novo do Neon) — backup sem restore testado não é backup.
3. **Logs históricos (opcional):** Axiom ou Better Stack (free tiers generosos) recebendo o `fly logs` via shipper/NATS quando houver necessidade real.

### 6.9 Cutover e rollback (Fase 6)

1. **D-1:** baixar TTL do DNS para 300s; comunicar janela aos usuários.
2. **Janela:** congelar escrita (avisar usuários / desligar app antigo) → `pg_dump` final da origem → restore no Neon → validar contagens → apontar DNS/entregar nova URL → smoke test completo (login, CRUD, mapa, planilha).
3. **Rollback:** manter o ambiente antigo intacto por 2 semanas. Rollback = reverter DNS + (se houve escrita nova no Neon) `pg_dump` do Neon de volta à origem.
4. **Descomissionar** o ambiente antigo após o período de observação.

### 6.10 Custo detalhado da Opção A

| Item | Início (piloto) | Produção estável | Observação |
|---|---|---|---|
| Cloudflare Pages + Functions | US$ 0 | US$ 0 | Free: 500 builds/mês, 100k req/dia nas Functions |
| Cloudflare DNS/CDN/WAF básico | US$ 0 | US$ 0 | Plano Free |
| Fly.io (1× shared-cpu-1x 512 MB, gru) | ~US$ 3 (com auto-stop) | ~US$ 6 (24/7) | 2ª máquina p/ HA: +US$ 3–6 |
| Neon Postgres (sa-east-1) | US$ 0 (free, 0,5 GB) | US$ 19 (Launch: sem suspensão, PITR 7d) | Free suspende após inatividade |
| R2 (backups) | US$ 0 | US$ 0 | 10 GB grátis |
| UptimeRobot / Better Stack | US$ 0 | US$ 0 | Free tier |
| GitHub Actions | US$ 0 | US$ 0 | Minutos grátis suficientes |
| **Total** | **~US$ 3/mês** | **~US$ 25–31/mês** | vs. US$ 80–200 no GCP equivalente |

**Caminho de upgrade sem re-arquitetura:** mais tráfego → subir vCPU/RAM no Fly (`fly scale vm`) e plano do Neon; nunca é preciso trocar de arquitetura para crescer 10× nesse porte de aplicação.

### 6.11 Troubleshooting comum da stack A

| Sintoma | Causa provável | Correção |
|---|---|---|
| Prisma: `prepared statement "sX" already exists` | Pooled URL sem `pgbouncer=true` | Adicionar `pgbouncer=true` na `DATABASE_URL` do Fly |
| Prisma: `P1001 Can't reach database` no migrate | Migrando pela URL pooled | Usar a URL **direta** (`NEON_DIRECT_URL`) nas migrações |
| 1ª requisição do dia lenta (2–5s) | Auto-suspend do Neon free + auto-stop do Fly | Neon Launch e/ou `min_machines_running = 1` |
| Rotas do Angular dão 404 no refresh | Saiu um `404.html` no build | Remover `404.html` — o fallback SPA do Pages é automático sem ele |
| Chamadas `/api/*` retornam 404 | Function não deployada ou path errado | Conferir `frontend/functions/api/[[path]].js` no repo e `API_ORIGIN` no painel |
| Mapa não carrega em produção | Token Mapbox restrito sem o domínio novo | Adicionar o domínio `*.pages.dev`/customizado nas URL restrictions do token |
| Health check do Fly falhando | Path `/api` mudou ou app lento no boot | Aumentar `grace_period`; criar `/health` dedicado |

### 6.12 Cronograma resumido

| Fase | Duração | Downtime |
|---|---|---|
| 0 — Preparação (Dockerfile, token Mapbox, contas) | 0,5 dia | zero |
| 1 — Neon (schema + dados) | 1h | zero |
| 2 — Fly (API no ar) | 1–2h | zero |
| 3 — Pages (frontend + proxy) | 1h | zero |
| 4 — CI/CD | 1h | zero |
| 5 — Observabilidade + backup | 1h | zero |
| 6 — Cutover | 0,5–1h | minutos (janela de congelamento) |
| **Total** | **~1,5 dia útil** | **~minutos** |

---

## 7. Comparativo final de custos (mensal, estimado)

| Cenário | GCP | Opção A | Opção B (Render) | Opção C (Hetzner) |
|---|---|---|---|---|
| Piloto/uso interno leve | US$ 40–80 | **US$ 3–10** | US$ 13–20 | US$ 5–8 |
| Produção pequena (sem cold start, PITR) | US$ 80–200 | **US$ 25–31** | US$ 25–40 | US$ 8–15 |
| Economia anual vs GCP | — | **~70–90%** | ~60–75% | ~85–90% |

## 8. Recomendação

- **Executar a Opção A** conforme a seção 6: melhor custo-benefício, zero mudança de código de negócio, upgrade suave (só subir de plano) e rollback fácil.
- Opção B se a prioridade for um único fornecedor; Opção C somente com capacidade de operar Linux/Docker/backup com disciplina.
- Pré-requisitos de qualquer deploy (inclusive no próprio GCP): **rotacionar o token Mapbox exposto** e **criar o Dockerfile da API**.

## 9. Checklist de migração (Opção A)

**Preparação**
- [ ] Contas criadas (Cloudflare, Fly, Neon) com 2FA
- [ ] Token Mapbox rotacionado + restrição por domínio
- [ ] `backend/Dockerfile.api` criado e testado localmente
- [ ] (Opcional) endpoint `GET /health` adicionado

**Banco (Neon)**
- [ ] Projeto criado em `sa-east-1`, URLs pooled/direta anotadas
- [ ] `prisma migrate deploy` aplicado via URL direta
- [ ] Dados migrados e contagens das 10 tabelas validadas (ou seed executado)
- [ ] Branch `dev` criado para testes de migração

**API (Fly)**
- [ ] App `lt-planner-api` em `gru` com `fly.toml` revisado
- [ ] Secrets configurados (`DATABASE_URL` pooled + `pgbouncer=true`, `JWT_SECRET`, `JWT_EXPIRES_IN_SECONDS`)
- [ ] Deploy OK, health check passing, Swagger + login + 1 CRUD validados

**Frontend (Pages)**
- [ ] Projeto conectado ao repo (root `frontend`, output `dist/my-project/browser`, `NODE_VERSION=20`)
- [ ] `frontend/functions/api/[[path]].js` commitada + `API_ORIGIN` configurada
- [ ] Smoke test: login, listas, mapa 3D, importação xlsx, refresh em rota interna

**Go-live**
- [ ] Domínio custom no Pages com SSL ativo
- [ ] `deploy-api.yml` + secrets (`NEON_DIRECT_URL`, `FLY_API_TOKEN`) funcionando
- [ ] Uptime monitors ativos + backup semanal p/ R2 agendado e **restore testado**
- [ ] Cutover executado, ambiente antigo preservado por 2 semanas, rollback documentado
