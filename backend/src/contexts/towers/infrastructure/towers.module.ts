import { Module } from '@nestjs/common';

import { CreateTowerUseCase } from '@/contexts/towers/application/usecases/create-tower.usecase';
import { DeleteTowerUseCase } from '@/contexts/towers/application/usecases/delete-tower.usecase';
import { GetTowerUseCase } from '@/contexts/towers/application/usecases/get-tower.usecase';
import { ListTowersUseCase } from '@/contexts/towers/application/usecases/list-towers.usecase';
import { UpdateTowerUseCase } from '@/contexts/towers/application/usecases/update-tower.usecase';
import { TOWERS_REPOSITORY } from '@/contexts/towers/domain/towers.repository';
import { PrismaTowersRepository } from '@/contexts/towers/infrastructure/database/prisma/prisma-towers.repository';
import { TowersController } from '@/contexts/towers/infrastructure/towers.controller';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [TowersController],
  providers: [
    {
      provide: TOWERS_REPOSITORY,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => new PrismaTowersRepository(prisma),
    },
    {
      provide: CreateTowerUseCase,
      inject: [TOWERS_REPOSITORY],
      useFactory: (repo) => new CreateTowerUseCase(repo),
    },
    {
      provide: ListTowersUseCase,
      inject: [TOWERS_REPOSITORY],
      useFactory: (repo) => new ListTowersUseCase(repo),
    },
    {
      provide: GetTowerUseCase,
      inject: [TOWERS_REPOSITORY],
      useFactory: (repo) => new GetTowerUseCase(repo),
    },
    {
      provide: UpdateTowerUseCase,
      inject: [TOWERS_REPOSITORY],
      useFactory: (repo) => new UpdateTowerUseCase(repo),
    },
    {
      provide: DeleteTowerUseCase,
      inject: [TOWERS_REPOSITORY],
      useFactory: (repo) => new DeleteTowerUseCase(repo),
    },
  ],
})
export class TowersModule {}

