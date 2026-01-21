
import { Module } from '@nestjs/common';

import { CreateWorkUseCase } from '@/contexts/works/application/usecases/create-work.usecase';
import { DeleteWorkUseCase } from '@/contexts/works/application/usecases/delete-work.usecase';
import { GetWorkUseCase } from '@/contexts/works/application/usecases/get-work.usecase';
import { ListWorksUseCase } from '@/contexts/works/application/usecases/list-works.usecase';
import { UpdateWorkUseCase } from '@/contexts/works/application/usecases/update-work.usecase';
import { WORKS_REPOSITORY } from '@/contexts/works/domain/works.repository';
import { PrismaWorksRepository } from '@/contexts/works/infrastructure/database/prisma/prisma-works.repository';
import { WorksController } from '@/contexts/works/infrastructure/works.controller';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [WorksController],
  providers: [
    {
      provide: WORKS_REPOSITORY,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => new PrismaWorksRepository(prisma),
    },
    {
      provide: CreateWorkUseCase,
      inject: [WORKS_REPOSITORY],
      useFactory: (repo) => new CreateWorkUseCase(repo),
    },
    {
      provide: ListWorksUseCase,
      inject: [WORKS_REPOSITORY],
      useFactory: (repo) => new ListWorksUseCase(repo),
    },
    {
      provide: GetWorkUseCase,
      inject: [WORKS_REPOSITORY],
      useFactory: (repo) => new GetWorkUseCase(repo),
    },
    {
      provide: UpdateWorkUseCase,
      inject: [WORKS_REPOSITORY],
      useFactory: (repo) => new UpdateWorkUseCase(repo),
    },
    {
      provide: DeleteWorkUseCase,
      inject: [WORKS_REPOSITORY],
      useFactory: (repo) => new DeleteWorkUseCase(repo),
    },
  ],
  exports: [WORKS_REPOSITORY], // Export repository if needed by other modules
})
export class WorksModule { }
