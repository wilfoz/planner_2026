import { Module } from '@nestjs/common';

import { AddTeamToProductionUseCase, DelTeamFromProductionUseCase } from '@/contexts/productions/application/usecases/link-team.usecases';
import { AddTowerToProductionUseCase, DelTowerFromProductionUseCase } from '@/contexts/productions/application/usecases/link-tower.usecases';
import { CreateProductionUseCase } from '@/contexts/productions/application/usecases/create-production.usecase';
import { DeleteProductionUseCase } from '@/contexts/productions/application/usecases/delete-production.usecase';
import { GetProductionUseCase } from '@/contexts/productions/application/usecases/get-production.usecase';
import { ListProductionsUseCase } from '@/contexts/productions/application/usecases/list-productions.usecase';
import { UpdateProductionUseCase } from '@/contexts/productions/application/usecases/update-production.usecase';
import { PRODUCTIONS_REPOSITORY } from '@/contexts/productions/domain/productions.repository';
import { PrismaProductionsRepository } from '@/contexts/productions/infrastructure/database/prisma/prisma-productions.repository';
import { ProductionsController } from '@/contexts/productions/infrastructure/productions.controller';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [ProductionsController],
  providers: [
    {
      provide: PRODUCTIONS_REPOSITORY,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => new PrismaProductionsRepository(prisma),
    },
    {
      provide: CreateProductionUseCase,
      inject: [PRODUCTIONS_REPOSITORY],
      useFactory: (repo) => new CreateProductionUseCase(repo),
    },
    {
      provide: ListProductionsUseCase,
      inject: [PRODUCTIONS_REPOSITORY],
      useFactory: (repo) => new ListProductionsUseCase(repo),
    },
    {
      provide: GetProductionUseCase,
      inject: [PRODUCTIONS_REPOSITORY],
      useFactory: (repo) => new GetProductionUseCase(repo),
    },
    {
      provide: UpdateProductionUseCase,
      inject: [PRODUCTIONS_REPOSITORY],
      useFactory: (repo) => new UpdateProductionUseCase(repo),
    },
    {
      provide: DeleteProductionUseCase,
      inject: [PRODUCTIONS_REPOSITORY],
      useFactory: (repo) => new DeleteProductionUseCase(repo),
    },
    {
      provide: AddTeamToProductionUseCase,
      inject: [PRODUCTIONS_REPOSITORY],
      useFactory: (repo) => new AddTeamToProductionUseCase(repo),
    },
    {
      provide: DelTeamFromProductionUseCase,
      inject: [PRODUCTIONS_REPOSITORY],
      useFactory: (repo) => new DelTeamFromProductionUseCase(repo),
    },
    {
      provide: AddTowerToProductionUseCase,
      inject: [PRODUCTIONS_REPOSITORY],
      useFactory: (repo) => new AddTowerToProductionUseCase(repo),
    },
    {
      provide: DelTowerFromProductionUseCase,
      inject: [PRODUCTIONS_REPOSITORY],
      useFactory: (repo) => new DelTowerFromProductionUseCase(repo),
    },
  ],
})
export class ProductionsModule {}

