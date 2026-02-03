FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY src/shared/infrastructure/database/prisma ./src/shared/infrastructure/database/prisma

COPY scripts ./scripts
RUN npm install --legacy-peer-deps
RUN npx prisma generate --schema src/shared/infrastructure/database/prisma/schema.prisma

COPY . .

CMD ["sh", "-c", "npx prisma generate --schema src/shared/infrastructure/database/prisma/schema.prisma && npm run start:dev"]

