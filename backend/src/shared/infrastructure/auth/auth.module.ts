import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service';
import { AuthService } from '@/shared/infrastructure/auth/auth.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [EnvConfigService],
      useFactory: (env: EnvConfigService) => ({
        secret: env.getJwtSecret(),
        signOptions: {
          expiresIn: env.getJwtExpiresInSeconds(),
        },
      }),
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

