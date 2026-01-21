import { Module } from '@nestjs/common';

import { CreateTaskUseCase } from '@/contexts/task/application/usecases/create-task.usecase';
import { DeleteTaskUseCase } from '@/contexts/task/application/usecases/delete-task.usecase';
import { GetTaskUseCase } from '@/contexts/task/application/usecases/get-task.usecase';
import { ListTaskUseCase } from '@/contexts/task/application/usecases/list-task.usecase';
import { UpdateTaskUseCase } from '@/contexts/task/application/usecases/update-task.usecase';
import { TASK_REPOSITORY } from '@/contexts/task/domain/task.repository';
import { PrismaTaskRepository } from '@/contexts/task/infrastructure/database/prisma/prisma-task.repository';
import { TaskController } from '@/contexts/task/infrastructure/task.controller';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [TaskController],
  providers: [
    {
      provide: TASK_REPOSITORY,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => new PrismaTaskRepository(prisma),
    },
    {
      provide: CreateTaskUseCase,
      inject: [TASK_REPOSITORY],
      useFactory: (repo) => new CreateTaskUseCase(repo),
    },
    {
      provide: ListTaskUseCase,
      inject: [TASK_REPOSITORY],
      useFactory: (repo) => new ListTaskUseCase(repo),
    },
    {
      provide: GetTaskUseCase,
      inject: [TASK_REPOSITORY],
      useFactory: (repo) => new GetTaskUseCase(repo),
    },
    {
      provide: UpdateTaskUseCase,
      inject: [TASK_REPOSITORY],
      useFactory: (repo) => new UpdateTaskUseCase(repo),
    },
    {
      provide: DeleteTaskUseCase,
      inject: [TASK_REPOSITORY],
      useFactory: (repo) => new DeleteTaskUseCase(repo),
    },
  ],
})
export class TaskModule {}

