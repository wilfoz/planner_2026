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
import { STATUS_PRODUCTION } from '@prisma/client';

import { CreateProductionUseCase } from '@/contexts/productions/application/usecases/create-production.usecase';
import { DeleteProductionUseCase } from '@/contexts/productions/application/usecases/delete-production.usecase';
import { GetProductionUseCase } from '@/contexts/productions/application/usecases/get-production.usecase';
import { ListProductionsUseCase } from '@/contexts/productions/application/usecases/list-productions.usecase';
import { UpdateProductionUseCase } from '@/contexts/productions/application/usecases/update-production.usecase';
import { AddTeamToProductionUseCase, DelTeamFromProductionUseCase } from '@/contexts/productions/application/usecases/link-team.usecases';
import { AddTowerToProductionUseCase, DelTowerFromProductionUseCase } from '@/contexts/productions/application/usecases/link-tower.usecases';
import { CreateProductionDto } from '@/contexts/productions/infrastructure/dto/create-production.dto';
import { ListProductionsQueryDto } from '@/contexts/productions/infrastructure/dto/list-productions.query.dto';
import { ProductionSnapshotDto } from '@/contexts/productions/infrastructure/dto/production-snapshot.dto';
import { UpdateProductionDto } from '@/contexts/productions/infrastructure/dto/update-production.dto';
import { ProductionPresenter } from '@/contexts/productions/infrastructure/presenters/production.presenter';
import { CollectionPresenter } from '@/shared/presenters/collection.presenter';

@ApiTags('Production')
@Controller('production')
export class ProductionsController {
  constructor(
    private readonly createProduction: CreateProductionUseCase,
    private readonly listProductions: ListProductionsUseCase,
    private readonly getProduction: GetProductionUseCase,
    private readonly updateProduction: UpdateProductionUseCase,
    private readonly deleteProduction: DeleteProductionUseCase,
    private readonly addTeam: AddTeamToProductionUseCase,
    private readonly delTeam: DelTeamFromProductionUseCase,
    private readonly addTower: AddTowerToProductionUseCase,
    private readonly delTower: DelTowerFromProductionUseCase,
  ) { }

  @Post()
  async create(@Body() dto: CreateProductionDto) {
    const output = await this.createProduction.execute({
      status: dto.status ?? STATUS_PRODUCTION.EXECUTED,
      comments: dto.comments ?? null,
      start_time: dto.start_time ? new Date(dto.start_time) : null,
      final_time: dto.final_time ? new Date(dto.final_time) : null,
      task_id: dto.task_id,
      work_id: dto.work_id,
      teams: dto.teams ?? [],
      towers: dto.towers ?? [],
    });
    return new ProductionPresenter(output);
  }

  @Get()
  async list(@Query() query: ListProductionsQueryDto) {
    const result = await this.listProductions.execute(query);
    return new CollectionPresenter({
      meta: result.meta,
      data: result.data.map((p) => new ProductionPresenter(p)),
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const output = await this.getProduction.execute({ id });
    return new ProductionPresenter(output);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductionDto) {
    const output = await this.updateProduction.execute({
      id,
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.comments !== undefined ? { comments: dto.comments } : {}),
      ...(dto.start_time !== undefined ? { start_time: dto.start_time ? new Date(dto.start_time) : null } : {}),
      ...(dto.final_time !== undefined ? { final_time: dto.final_time ? new Date(dto.final_time) : null } : {}),
      ...(dto.task_id !== undefined ? { task_id: dto.task_id } : {}),
      ...(dto.teams !== undefined ? { teams: dto.teams } : {}),
      ...(dto.towers !== undefined ? { towers: dto.towers } : {}),
    });
    return new ProductionPresenter(output);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteProduction.execute({ id });
  }

  @Put('add-team/:id')
  async addTeamToProduction(@Param('id') teamId: string, @Body() body: ProductionSnapshotDto) {
    const output = await this.addTeam.execute({ productionId: body.id, teamId });
    return new ProductionPresenter(output);
  }

  @Put('del-team/:id')
  async delTeamFromProduction(@Param('id') teamId: string, @Body() body: ProductionSnapshotDto) {
    const output = await this.delTeam.execute({ productionId: body.id, teamId });
    return new ProductionPresenter(output);
  }

  @Put('add-tower/:id')
  async addTowerToProduction(@Param('id') towerId: string, @Body() body: ProductionSnapshotDto) {
    const output = await this.addTower.execute({ productionId: body.id, towerId });
    return new ProductionPresenter(output);
  }

  @Put('del-tower/:id')
  async delTowerFromProduction(@Param('id') towerId: string, @Body() body: ProductionSnapshotDto) {
    const output = await this.delTower.execute({ productionId: body.id, towerId });
    return new ProductionPresenter(output);
  }
}

