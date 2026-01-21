import { Module } from '@nestjs/common';

import { CreateFoundationUseCase } from '@/contexts/foundations/application/usecases/create-foundation.usecase';
import { DeleteFoundationUseCase } from '@/contexts/foundations/application/usecases/delete-foundation.usecase';
import { GetFoundationUseCase } from '@/contexts/foundations/application/usecases/get-foundation.usecase';
import { ListFoundationsUseCase } from '@/contexts/foundations/application/usecases/list-foundations.usecase';
import { UpdateFoundationUseCase } from '@/contexts/foundations/application/usecases/update-foundation.usecase';
import { FOUNDATIONS_REPOSITORY } from '@/contexts/foundations/domain/foundations.repository';
import { PrismaFoundationsRepository } from '@/contexts/foundations/infrastructure/database/prisma/prisma-foundations.repository';
import { FoundationsController } from '@/contexts/foundations/infrastructure/foundations.controller';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [FoundationsController],
  providers: [
    {
      provide: FOUNDATIONS_REPOSITORY,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => new PrismaFoundationsRepository(prisma),
    },
    {
      provide: CreateFoundationUseCase,
      inject: [FOUNDATIONS_REPOSITORY],
      useFactory: (repo) => new CreateFoundationUseCase(repo),
    },
    {
      provide: ListFoundationsUseCase,
      inject: [FOUNDATIONS_REPOSITORY],
      useFactory: (repo) => new ListFoundationsUseCase(repo),
    },
    {
      provide: GetFoundationUseCase,
      inject: [FOUNDATIONS_REPOSITORY],
      useFactory: (repo) => new GetFoundationUseCase(repo),
    },
    {
      provide: UpdateFoundationUseCase,
      inject: [FOUNDATIONS_REPOSITORY],
      useFactory: (repo) => new UpdateFoundationUseCase(repo),
    },
    {
      provide: DeleteFoundationUseCase,
      inject: [FOUNDATIONS_REPOSITORY],
      useFactory: (repo) => new DeleteFoundationUseCase(repo),
    },
  ],
})
export class FoundationsModule {}

