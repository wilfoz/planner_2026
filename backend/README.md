## LT - PLANNER (Backend)

API REST em **NestJS + Fastify + Swagger + Prisma/Postgres**, seguindo **DDD/Clean Architecture por bounded context**.

### Requisitos
- Node **LTS** (compatível com NestJS atual)
- Docker Desktop (para Postgres)

### Subir Postgres

```bash
docker compose up -d
```

### Variáveis de ambiente

Por padrão, o projeto carrega `envFilePath: <root>/.env.${NODE_ENV}` via `EnvConfigModule`.

Como arquivos `.env*` normalmente não são commitados, este repo inclui templates:
- `env.development.example`
- `env.test.example`
- `env.example`

Ao rodar `npm install`, o script `postinstall` cria automaticamente:
- `.env.development`
- `.env.test`
- `.env`

Se quiser recriar manualmente:

```bash
npm run env:setup
```

### Prisma

Schema: `src/shared/infrastructure/database/prisma/schema.prisma`

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Rodar a API (Swagger em `/api`)

```bash
npm run start:dev
```

### Testes

```bash
npm run test:unit
npm run test:int
npm run test:e2e
```

### Testar endpoints no Insomnia (collection pronta)

Arquivo de import:
- `insomnia/LT-PLANNER.insomnia.json`

Passos:
- No Insomnia: **Application → Preferences →** (opcional) habilite scripts se seu ambiente exigir.
- **Import/Export → Import Data → From File** e selecione `insomnia/LT-PLANNER.insomnia.json`
- Selecione o environment **Local**
- Execute na ordem (Users → Employees/Equipments → Teams → Foundations → Towers → Task → Production → Cleanup)

