import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '@/app.module';
import { applyGlobalConfig } from '@/shared/config/apply-global-config';
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // Swagger (GET /api)
  const config = new DocumentBuilder()
    .setTitle('LT - PLANNER')
    .setDescription('LT - PLANNER API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  applyGlobalConfig(app);

  const env = app.get(EnvConfigService);
  await app.listen(env.getAppPort(), '0.0.0.0');
}

bootstrap();

