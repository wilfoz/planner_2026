import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { WrapperDataInterceptor } from '@/shared/interceptors/wrapper-data.interceptor';
import { ConflictErrorFilter } from '@/shared/filters/conflict-error.filter';
import { InvalidCredentialsErrorFilter } from '@/shared/filters/invalid-credentials-error.filter';
import { InvalidPasswordErrorFilter } from '@/shared/filters/invalid-password-error.filter';
import { NotFoundErrorFilter } from '@/shared/filters/not-found-error.filter';

export function applyGlobalConfig(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new WrapperDataInterceptor(),
    new ClassSerializerInterceptor(reflector),
  );

  app.useGlobalFilters(
    new ConflictErrorFilter(),
    new NotFoundErrorFilter(),
    new InvalidPasswordErrorFilter(),
    new InvalidCredentialsErrorFilter(),
  );
}

