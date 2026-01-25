
import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { WorkOutput } from '@/contexts/works/application/dto/work.output';
import { CreateWorkUseCase } from '@/contexts/works/application/usecases/create-work.usecase';
import { DeleteWorkUseCase } from '@/contexts/works/application/usecases/delete-work.usecase';
import { GetWorkUseCase } from '@/contexts/works/application/usecases/get-work.usecase';
import { ListWorksUseCase, WorksListOutput } from '@/contexts/works/application/usecases/list-works.usecase';
import { UpdateWorkUseCase } from '@/contexts/works/application/usecases/update-work.usecase';
import { CreateWorkDto } from '@/contexts/works/infrastructure/dto/create-work.dto';
import { ListWorksQueryDto } from '@/contexts/works/infrastructure/dto/list-works.query.dto';
import { UpdateWorkDto } from '@/contexts/works/infrastructure/dto/update-work.dto';
import { AuthGuard } from '@/shared/infrastructure/auth/auth.guard';

@ApiTags('Works')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('works')
export class WorksController {
  constructor(
    private readonly createWorkUseCase: CreateWorkUseCase,
    private readonly listWorksUseCase: ListWorksUseCase,
    private readonly getWorkUseCase: GetWorkUseCase,
    private readonly updateWorkUseCase: UpdateWorkUseCase,
    private readonly deleteWorkUseCase: DeleteWorkUseCase,
  ) { }

  @Post()
  @ApiCreatedResponse({ type: WorkOutput })
  create(@Body() dto: CreateWorkDto) {
    return this.createWorkUseCase.execute(dto);
  }

  @Get()
  @ApiOkResponse({ type: WorkOutput, isArray: true }) // Simplified for list output
  list(@Query() query: ListWorksQueryDto) {
    return this.listWorksUseCase.execute(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: WorkOutput })
  get(@Param('id') id: string) {
    return this.getWorkUseCase.execute(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: WorkOutput })
  update(@Param('id') id: string, @Body() dto: UpdateWorkDto) {
    return this.updateWorkUseCase.execute(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse()
  delete(@Param('id') id: string) {
    return this.deleteWorkUseCase.execute(id);
  }
}
