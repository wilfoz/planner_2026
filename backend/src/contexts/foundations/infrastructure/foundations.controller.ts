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

import { CreateFoundationUseCase } from '@/contexts/foundations/application/usecases/create-foundation.usecase';
import { DeleteFoundationUseCase } from '@/contexts/foundations/application/usecases/delete-foundation.usecase';
import { GetFoundationUseCase } from '@/contexts/foundations/application/usecases/get-foundation.usecase';
import { ListFoundationsUseCase } from '@/contexts/foundations/application/usecases/list-foundations.usecase';
import { UpdateFoundationUseCase } from '@/contexts/foundations/application/usecases/update-foundation.usecase';
import { CreateFoundationDto } from '@/contexts/foundations/infrastructure/dto/create-foundation.dto';
import { ListFoundationsQueryDto } from '@/contexts/foundations/infrastructure/dto/list-foundations.query.dto';
import { UpdateFoundationDto } from '@/contexts/foundations/infrastructure/dto/update-foundation.dto';
import { FoundationPresenter } from '@/contexts/foundations/infrastructure/presenters/foundation.presenter';
import { CollectionPresenter } from '@/shared/presenters/collection.presenter';

@ApiTags('Foundations')
@Controller('foundation')
export class FoundationsController {
  constructor(
    private readonly createFoundation: CreateFoundationUseCase,
    private readonly listFoundations: ListFoundationsUseCase,
    private readonly getFoundation: GetFoundationUseCase,
    private readonly updateFoundation: UpdateFoundationUseCase,
    private readonly deleteFoundation: DeleteFoundationUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateFoundationDto) {
    const output = await this.createFoundation.execute(dto);
    return new FoundationPresenter(output);
  }

  @Get()
  async list(@Query() query: ListFoundationsQueryDto) {
    const result = await this.listFoundations.execute(query);
    return new CollectionPresenter({
      meta: result.meta,
      data: result.data.map((f) => new FoundationPresenter(f)),
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const output = await this.getFoundation.execute({ id });
    return new FoundationPresenter(output);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFoundationDto) {
    const output = await this.updateFoundation.execute({ id, ...dto });
    return new FoundationPresenter(output);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteFoundation.execute({ id });
  }
}

