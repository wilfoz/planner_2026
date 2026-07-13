# Guia de Migração — Alternativas de Melhor Custo-Benefício ao Google Cloud (GCP)

> **Projeto:** LT-PLANNER — Sistema de planejamento e orçamento de Linhas de Transmissão
> **Data:** Julho/2026
> **Escopo:** Avaliar alternativas ao GCP para hospedar 100% das funcionalidades existentes, com plano de migração passo a passo e lista explícita dos serviços que ficam de fora em cada opção.
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
| Configuração | `.env` via `EnvConfigService` (`DATABASE_URL`, porta, JWT) | Gestão de segredos |
| Contextos de negócio | works, towers, foundations, tasks, teams, equipments, employees, productions, users | CRUD via API — sem dependência de nuvem específica |

### Frontend (`frontend/`)
| Funcionalidade | Implementação | Requisito de infraestrutura |
|---|---|---|
| SPA | Angular 20 + TailwindCSS 4 | Hospedagem de arquivos estáticos + fallback de rotas para `index.html` |
| Mapa 3D (torres/cabos) | Deck.gl 9 + Mapbox GL 3 + glTF (`loaders.gl`) | **Mapbox é SaaS de terceiros** — independe da nuvem escolhida |
| Cache offline do mapa | Dexie (IndexedDB, no navegador) | Nenhum (client-side) |
| Importação/exportação de planilhas | `xlsx` (client-side, ex.: importação de torres) | Nenhum (client-side) |
| Proxy de API em dev | `proxy.conf.json` (`/api`) | Em produção: mesmo domínio (rewrite) ou CORS configurado |
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

Se o sistema fosse (ou estiver sendo) implantado no GCP, a arquitetura típica e seu custo seriam:

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

O maior peso é o **Cloud SQL** (cobra instância 24/7 + storage + backup + HA) e o **Load Balancer fixo** — exatamente onde as alternativas abaixo economizam.

---

## 3. Alternativas avaliadas

### Opção A — "Best-of-breed" serverless (RECOMENDADA: melhor custo-benefício)

Combina o melhor serviço gratuito/barato de cada categoria:

| Componente | Serviço | Plano sugerido | Custo/mês |
|---|---|---|---|
| Frontend Angular | **Cloudflare Pages** | Free (builds ilimitados p/ uso normal, CDN global, SSL) | **US$ 0** |
| API NestJS | **Fly.io** (container) ou **Railway** | Fly: 1–2 máquinas `shared-cpu-1x` 512 MB · Railway: plano Hobby | **US$ 5–15** |
| PostgreSQL | **Neon** (Postgres serverless) | Free (0,5 GB) → Launch US$ 19 | **US$ 0–19** |
| Segredos | Nativo do Fly/Railway (`fly secrets`, variables) | Incluído | US$ 0 |
| CI/CD | GitHub Actions (já existe) + deploy via CLI | Free p/ repositório | US$ 0 |
| **Total** | | | **US$ 5–35/mês** |

**Por que funciona bem para o LT-PLANNER:**
- Neon é Postgres real → **Prisma funciona sem mudança alguma** (só troca a `DATABASE_URL`; usar a connection string com pooler/pgbouncer).
- Cloudflare Pages serve a SPA com CDN global grátis e suporta rewrite `/api/*` para a API (via `_redirects` ou Cloudflare Worker de 1 linha), mantendo o mesmo modelo do `proxy.conf.json` de dev — sem dor de CORS.
- Fly.io/Railway rodam o container NestJS+Fastify como está.

**Contras:** três fornecedores para administrar; free tier do Neon suspende o banco após inatividade (cold start de ~1s — irrelevante para uso interno, mas considere o plano pago para produção séria).

---

### Opção B — PaaS único (mais simples de operar)

Tudo em um único fornecedor:

| Fornecedor | Frontend | API | Postgres | Custo/mês |
|---|---|---|---|---|
| **Render** | Static Site (free) | Web Service US$ 7 (Starter) | Postgres US$ 6–20 | **US$ 13–30** |
| **Railway** | Static/serviço | Serviço por uso (~US$ 5–10) | Postgres por uso (~US$ 5–15) | **US$ 10–25** |
| **DigitalOcean App Platform** | Static Site (3 grátis) | App US$ 5–12 | Managed PG US$ 15+ | **US$ 20–30** |

**Prós:** um só painel, um só faturamento, deploy por push no GitHub nativo, preview environments (Render/Railway).
**Contras:** um pouco mais caro que a Opção A no médio prazo; Postgres gerenciado desses PaaS tem menos recursos (réplicas, PITR limitado nos planos baratos).

---

### Opção C — VPS auto-gerenciado (menor custo absoluto, mais responsabilidade)

| Componente | Serviço | Custo/mês |
|---|---|---|
| Servidor | **Hetzner Cloud** CX22/CPX11 (2 vCPU, 4 GB) — ou Contabo/OVH | **US$ 4–8** |
| Orquestração | **Coolify** ou **Dokploy** (self-hosted PaaS, open-source) | US$ 0 |
| Postgres | Container no próprio VPS (o docker-compose existente já serve de base) | US$ 0 |
| Frontend | Servido pelo Caddy/Nginx do próprio VPS ou Cloudflare Pages (free) | US$ 0 |
| TLS/DNS/CDN | Cloudflare (free) na frente do VPS | US$ 0 |
| Backup externo | Hetzner Backup (+20% ≈ US$ 1) + `pg_dump` p/ Cloudflare R2/Backblaze B2 | **US$ 1–3** |
| **Total** | | **US$ 5–12/mês** |

**Prós:** custo imbatível, controle total, sem limites de free tier, roda tudo (API + PG + frontend) numa máquina só com folga para esse porte de aplicação.
**Contras:** **você vira o SRE** — atualizações de SO, hardening, monitoramento, backup e restore testado, disponibilidade. Sem SLA. Recomendado só se houver alguém confortável com Linux/Docker no time.

---

## 4. Tabela de-para: GCP → Alternativas

| Serviço GCP | Opção A (best-of-breed) | Opção B (Render) | Opção C (Hetzner) |
|---|---|---|---|
| Cloud Run | Fly.io / Railway | Render Web Service | Docker + Coolify |
| Cloud SQL (Postgres) | Neon / Supabase | Render Postgres | Postgres em container |
| Firebase Hosting / GCS+CDN | Cloudflare Pages | Render Static Site | Caddy/Nginx + Cloudflare |
| Cloud Load Balancing | Incluído (Fly proxy / CF) | Incluído | Caddy/Nginx |
| Secret Manager | Fly/Railway secrets | Render env groups | Coolify secrets / `.env` no host |
| Artifact Registry | Fly registry / GHCR (grátis) | Build nativo do Render | GHCR (grátis) |
| Cloud Build | GitHub Actions (já existente) | Deploy nativo por push | GitHub Actions + webhook Coolify |
| Cloud Logging | Logs nativos do Fly/Railway (retenção curta) + Better Stack/Axiom (free tier) | Logs do Render | Dozzle/Loki ou Better Stack |
| Cloud Monitoring / Uptime | Better Stack / UptimeRobot (free) | Render metrics + UptimeRobot | Netdata (free) + UptimeRobot |
| Cloud Armor (WAF) | Cloudflare Free (WAF básico) | — *(sem equivalente)* | Cloudflare Free + fail2ban |
| Cloud DNS | Cloudflare DNS (free) | Cloudflare DNS | Cloudflare DNS |
| Cloud Scheduler | Fly Machines cron / GitHub Actions cron | Render Cron Jobs (US$ 1) | cron do Linux |
| IAM (contas de serviço) | Tokens por app (menos granular) | Times/roles do Render | Usuários Linux/SSH |

---

## 5. Serviços que FICAM DE FORA (sem equivalente direto)

Exigência do guia: o que o GCP oferece e que **nenhuma das opções acima cobre de forma equivalente**. Hoje o LT-PLANNER **não usa nada disto no código**, então a perda é de *capacidade futura*, não de funcionalidade atual:

| Serviço GCP sem equivalente | Impacto para o LT-PLANNER | Mitigação se precisar no futuro |
|---|---|---|
| **BigQuery** (data warehouse) | Nenhum hoje. Relevante se um dia quiser análises massivas de produção/orçamento | ClickHouse Cloud, DuckDB/MotherDuck, ou o próprio Postgres até dezenas de GB |
| **Pub/Sub** (mensageria gerenciada) | Nenhum hoje (não há filas/eventos no código) | Redis/BullMQ no mesmo host, ou Upstash (free tier) |
| **Vertex AI / Gemini na plataforma** | Nenhum hoje | APIs diretas (Anthropic/OpenAI) independem da nuvem |
| **VPC Service Controls / IAM ultra-granular** | Baixo — app pequeno, um time | Boas práticas: segredos por serviço, 2FA nos painéis |
| **Cloud Armor avançado** (regras WAF customizadas, rate-limit L7 gerenciado) | Baixo — mitigável | Cloudflare Pro (US$ 20) se sofrer ataques reais |
| **Cloud Spanner / AlloyDB** | Nenhum — Postgres comum atende com sobra | — |
| **SLA corporativo unificado + suporte 24/7** | Fly/Neon/CF têm SLAs menores nos planos baratos; Hetzner não tem SLA de aplicação | Aceitar o risco (uso interno) ou plano pago com SLA |
| **Multi-região automática com failover gerenciado** | Nenhum hoje (single-region é suficiente) | Neon tem réplicas; Fly roda multi-região com config manual |
| **Cloud Trace / Profiler (APM nativo)** | Baixo | OpenTelemetry + Grafana Cloud free tier |

**Específico da Opção C (VPS):** além dos itens acima, ficam de fora *todos* os serviços gerenciados — backup automático de banco com PITR, patching automático, escalonamento automático. Tudo passa a ser responsabilidade operacional sua.

**O que NÃO fica de fora em nenhuma opção** (garantido pelo inventário da seção 1): API NestJS completa (todos os 9 contextos), Postgres/Prisma com migrações e seed, JWT, Swagger, SPA Angular com mapa 3D Deck.gl/Mapbox, importação xlsx, cache offline Dexie, CI no GitHub Actions. **Mapbox continua funcionando identicamente — é contratado à parte da nuvem.**

---

## 6. Plano de migração passo a passo (Opção A como alvo; ajustes para B/C indicados)

### Fase 0 — Preparação (sem downtime, ~meio dia)
1. **Criar `Dockerfile` da API** — o `backend/Dockerfile` atual é apenas o Postgres de dev. Criar um multi-stage para a aplicação:
   ```dockerfile
   FROM node:20-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run prisma:generate && npm run build
   FROM node:20-alpine
   WORKDIR /app
   ENV NODE_ENV=production
   COPY --from=build /app/dist ./dist
   COPY --from=build /app/node_modules ./node_modules
   COPY --from=build /app/src/shared/infrastructure/database/prisma ./prisma
   EXPOSE 3000
   CMD ["node", "dist/main.js"]
   ```
2. Garantir que a API lê `PORT`/`DATABASE_URL`/segredo JWT **somente** de variáveis de ambiente (já é o caso via `EnvConfigService` — apenas conferir).
3. Rotacionar o token Mapbox e restringir por domínio (ver achado de segurança na seção 1). Idealmente injetar o token no build do Angular em vez de commitá-lo.
4. Testar o container localmente: `docker build` + `docker run` apontando para o Postgres do docker-compose.

### Fase 1 — Banco de dados (~1h)
1. Criar projeto no **Neon** (região `sa-east-1`/São Paulo se disponível, senão `us-east`) e copiar a connection string **com pooler**.
2. Aplicar o schema: `DATABASE_URL=<neon> npm run prisma:migrate:deploy`.
3. Migrar os dados (se já houver produção no GCP/Cloud SQL):
   ```bash
   pg_dump --no-owner --no-acl "$DATABASE_URL_ANTIGA" > dump.sql
   psql "$DATABASE_URL_NEON" < dump.sql
   ```
4. Rodar o seed apenas se for ambiente novo: `npm run` seed via `prisma db seed`.
5. Validar contagens de linhas das 10 tabelas entre origem e destino.

### Fase 2 — API (~1–2h)
1. `fly launch` (ou criar serviço no Railway/Render apontando para o repo, root `backend/`).
2. Configurar segredos: `DATABASE_URL`, `JWT_SECRET`, `PORT`.
3. Deploy e smoke test: `GET /api` (Swagger) deve abrir; login JWT deve funcionar; CRUD de um contexto (ex.: works) de ponta a ponta.
4. Configurar health check na rota da API e `min instances = 1` se quiser eliminar cold start (custo ~US$ 5).

### Fase 3 — Frontend (~1h)
1. Criar projeto no **Cloudflare Pages** apontando para o repo, build `npm run build -- --configuration production`, output `frontend/dist/<app>/browser`.
2. Configurar o rewrite `/api/* → https://<api>.fly.dev/api/*` (Worker/`_redirects`) **ou** definir `apiUrl` de produção com a URL absoluta da API + habilitar CORS no Fastify para o domínio do Pages.
3. Garantir fallback SPA (`/* → /index.html 200`) para as rotas do Angular Router.
4. Apontar o domínio próprio (DNS no Cloudflare, SSL automático).

### Fase 4 — CI/CD (~1h)
1. Manter o `ci.yml` atual (lint/test/build) intocado.
2. Adicionar job de deploy no push da `main`: `flyctl deploy` (API) — o Pages já faz deploy automático por push.
3. Adicionar step de `prisma migrate deploy` antes do deploy da API.

### Fase 5 — Observabilidade e backup (~1h)
1. Uptime: UptimeRobot/Better Stack (free) monitorando `GET /api` e o frontend.
2. Backup: Neon já tem PITR nos planos pagos; adicionalmente, GitHub Action semanal com `pg_dump` para um bucket barato (Cloudflare R2 — 10 GB free).
3. Logs: reter logs do Fly/Railway; se precisar de busca histórica, Axiom/Better Stack free tier.

### Fase 6 — Cutover e rollback
1. Baixar TTL do DNS para 300s um dia antes.
2. Janela de migração: congelar escrita → `pg_dump` final → restore → apontar DNS → validar.
3. **Rollback:** manter o ambiente antigo intacto por 2 semanas; rollback = reverter DNS + restaurar o dump pré-cutover na origem.
4. Descomissionar o ambiente antigo após o período de observação.

**Ajustes por opção:** Opção B — fases 1–3 viram criação de serviços no mesmo painel (Render: Web Service + Postgres + Static Site). Opção C — fase 1–3 viram instalação do Coolify no VPS Hetzner, deploy dos 3 componentes via painel, Cloudflare na frente; acrescente hardening de SSH, firewall (ufw) e rotina testada de restore.

---

## 7. Comparativo final de custos (mensal, estimado)

| Cenário | GCP | Opção A | Opção B (Render) | Opção C (Hetzner) |
|---|---|---|---|---|
| Piloto/uso interno leve | US$ 40–80 | **US$ 0–10** | US$ 13–20 | US$ 5–8 |
| Produção pequena (SLA razoável, sem cold start) | US$ 80–200 | **US$ 25–45** | US$ 25–40 | US$ 8–15 |
| Economia anual vs GCP | — | **~70–85%** | ~60–75% | ~85–90% |

## 8. Recomendação

- **Comece pela Opção A** (Cloudflare Pages + Fly.io/Railway + Neon): melhor relação custo-benefício, zero mudança de código, caminho de upgrade suave (só subir de plano) e fácil de reverter.
- **Escolha a Opção B** se a prioridade for simplicidade operacional com um único fornecedor e faturamento.
- **Escolha a Opção C** apenas se o custo for o critério dominante **e** houver capacidade de operar Linux/Docker/backup com disciplina.
- Em qualquer cenário, trate antes o **token Mapbox exposto** e crie o **Dockerfile da API** — ambos são pré-requisitos de qualquer deploy, inclusive no próprio GCP.

## 9. Checklist de migração

- [ ] Rotacionar token Mapbox + restrição por domínio
- [ ] Dockerfile multi-stage da API criado e testado localmente
- [ ] Banco criado no destino + `prisma migrate deploy` OK
- [ ] Dados migrados e contagens validadas (10 tabelas)
- [ ] API no ar com segredos configurados (Swagger + login + 1 CRUD validados)
- [ ] Frontend publicado com rewrite `/api` ou CORS configurado
- [ ] Fallback SPA configurado (rotas do Angular funcionam em refresh)
- [ ] Domínio + SSL ativos
- [ ] Deploy automático no push da `main`
- [ ] Uptime monitor + backup semanal agendado
- [ ] Plano de rollback documentado e ambiente antigo preservado por 2 semanas
