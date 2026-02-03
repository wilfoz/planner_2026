import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard, KeycloakConnectModule, ResourceGuard, RoleGuard, TokenValidation } from 'nest-keycloak-connect';

import { EmployeesModule } from '@/contexts/employees/infrastructure/employees.module';
import { EquipmentsModule } from '@/contexts/equipments/infrastructure/equipments.module';
import { FoundationsModule } from '@/contexts/foundations/infrastructure/foundations.module';
import { ProductionsModule } from '@/contexts/productions/infrastructure/productions.module';
import { TeamsModule } from '@/contexts/teams/infrastructure/teams.module';
import { TaskModule } from '@/contexts/task/infrastructure/task.module';
import { TowersModule } from '@/contexts/towers/infrastructure/towers.module';
import { UsersModule } from '@/contexts/users/infrastructure/users.module';
import { WorksModule } from '@/contexts/works/infrastructure/works.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { PrismaModule } from '@/shared/infrastructure/database/prisma/prisma.module';
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service';
import { HealthModule } from '@/shared/infrastructure/health/health.module';

import { DebugRoleGuard } from '@/shared/infrastructure/auth/guards/debug-role.guard';

@Module({
  imports: [
    EnvConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    EquipmentsModule,
    TeamsModule,
    FoundationsModule,
    TowersModule,
    TaskModule,
    ProductionsModule,
    WorksModule,
    HealthModule,
    KeycloakConnectModule.registerAsync({
      useFactory: (config: EnvConfigService) => ({
        authServerUrl: config.getKeycloakUrl(),
        realm: config.getKeycloakRealm(),
        clientId: config.getKeycloakClientId(),
        secret: config.getKeycloakClientSecret(),
        tokenValidation: TokenValidation.OFFLINE,
        useNestLogger: true,
      }),
      inject: [EnvConfigService],
    }),
  ],
  providers: [
    DebugRoleGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: DebugRoleGuard,
    },
  ],
})
export class AppModule { }

