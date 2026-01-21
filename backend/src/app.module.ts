import { Module } from '@nestjs/common';

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

@Module({
  imports: [EnvConfigModule, PrismaModule, AuthModule, UsersModule, EmployeesModule, EquipmentsModule, TeamsModule, FoundationsModule, TowersModule, TaskModule, ProductionsModule, WorksModule],
})
export class AppModule { }

