import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateTaskUseCase } from '@/contexts/task/application/usecases/create-task.usecase';
import { DeleteTaskUseCase } from '@/contexts/task/application/usecases/delete-task.usecase';
import { GetTaskUseCase } from '@/contexts/task/application/usecases/get-task.usecase';
import { ListTaskUseCase } from '@/contexts/task/application/usecases/list-task.usecase';
import { UpdateTaskUseCase } from '@/contexts/task/application/usecases/update-task.usecase';
import { CreateTaskDto } from '@/contexts/task/infrastructure/dto/create-task.dto';
import { ListTaskQueryDto } from '@/contexts/task/infrastructure/dto/list-task.query.dto';
import { UpdateTaskDto } from '@/contexts/task/infrastructure/dto/update-task.dto';
import { TaskPresenter } from '@/contexts/task/infrastructure/presenters/task.presenter';
import { CollectionPresenter } from '@/shared/presenters/collection.presenter';

@ApiTags('Task')
@Controller('task')
export class TaskController {
  constructor(
    private readonly createTask: CreateTaskUseCase,
    private readonly listTask: ListTaskUseCase,
    private readonly getTask: GetTaskUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTaskDto) {
    const output = await this.createTask.execute(dto);
    return new TaskPresenter(output);
  }

  @Get()
  async list(@Query() query: ListTaskQueryDto) {
    const result = await this.listTask.execute(query);
    return new CollectionPresenter({
      meta: result.meta,
      data: result.data.map((t) => new TaskPresenter(t)),
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const output = await this.getTask.execute({ id });
    return new TaskPresenter(output);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    const output = await this.updateTask.execute({ id, ...dto });
    return new TaskPresenter(output);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteTask.execute({ id });
  }
}

