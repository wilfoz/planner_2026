import { Module } from '@nestjs/common';

import { CreateEquipmentUseCase } from '@/contexts/equipments/application/usecases/create-equipment.usecase';
import { DeleteEquipmentUseCase } from '@/contexts/equipments/application/usecases/delete-equipment.usecase';
import { GetEquipmentUseCase } from '@/contexts/equipments/application/usecases/get-equipment.usecase';
import { ListEquipmentsUseCase } from '@/contexts/equipments/application/usecases/list-equipments.usecase';
import { UpdateEquipmentUseCase } from '@/contexts/equipments/application/usecases/update-equipment.usecase';
import { EQUIPMENTS_REPOSITORY } from '@/contexts/equipments/domain/equipments.repository';
import { PrismaEquipmentsRepository } from '@/contexts/equipments/infrastructure/database/prisma/prisma-equipments.repository';
import { EquipmentsController } from '@/contexts/equipments/infrastructure/equipments.controller';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [EquipmentsController],
  providers: [
    {
      provide: EQUIPMENTS_REPOSITORY,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => new PrismaEquipmentsRepository(prisma),
    },
    {
      provide: CreateEquipmentUseCase,
      inject: [EQUIPMENTS_REPOSITORY],
      useFactory: (repo) => new CreateEquipmentUseCase(repo),
    },
    {
      provide: ListEquipmentsUseCase,
      inject: [EQUIPMENTS_REPOSITORY],
      useFactory: (repo) => new ListEquipmentsUseCase(repo),
    },
    {
      provide: GetEquipmentUseCase,
      inject: [EQUIPMENTS_REPOSITORY],
      useFactory: (repo) => new GetEquipmentUseCase(repo),
    },
    {
      provide: UpdateEquipmentUseCase,
      inject: [EQUIPMENTS_REPOSITORY],
      useFactory: (repo) => new UpdateEquipmentUseCase(repo),
    },
    {
      provide: DeleteEquipmentUseCase,
      inject: [EQUIPMENTS_REPOSITORY],
      useFactory: (repo) => new DeleteEquipmentUseCase(repo),
    },
  ],
})
export class EquipmentsModule {}

