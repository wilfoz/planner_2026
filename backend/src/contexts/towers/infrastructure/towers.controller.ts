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

import { CreateTowerUseCase } from '@/contexts/towers/application/usecases/create-tower.usecase';
import { DeleteTowerUseCase } from '@/contexts/towers/application/usecases/delete-tower.usecase';
import { GetTowerUseCase } from '@/contexts/towers/application/usecases/get-tower.usecase';
import { ListTowersUseCase } from '@/contexts/towers/application/usecases/list-towers.usecase';
import { UpdateTowerUseCase } from '@/contexts/towers/application/usecases/update-tower.usecase';
import { CreateTowerDto } from '@/contexts/towers/infrastructure/dto/create-tower.dto';
import { ListTowersQueryDto } from '@/contexts/towers/infrastructure/dto/list-towers.query.dto';
import { UpdateTowerDto } from '@/contexts/towers/infrastructure/dto/update-tower.dto';
import { TowerPresenter } from '@/contexts/towers/infrastructure/presenters/tower.presenter';
import { FoundationPresenter } from '@/contexts/foundations/infrastructure/presenters/foundation.presenter';
import { CollectionPresenter } from '@/shared/presenters/collection.presenter';

@ApiTags('Towers')
@Controller('tower')
export class TowersController {
  constructor(
    private readonly createTower: CreateTowerUseCase,
    private readonly listTowers: ListTowersUseCase,
    private readonly getTower: GetTowerUseCase,
    private readonly updateTower: UpdateTowerUseCase,
    private readonly deleteTower: DeleteTowerUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTowerDto) {
    const output = await this.createTower.execute(dto);
    return new TowerPresenter({
      ...output,
      foundations: output.foundations.map((f) => new FoundationPresenter(f)),
    });
  }

  @Get()
  async list(@Query() query: ListTowersQueryDto) {
    const result = await this.listTowers.execute(query);
    return new CollectionPresenter({
      meta: result.meta,
      data: result.data.map(
        (t) =>
          new TowerPresenter({
            ...t,
            foundations: t.foundations.map((f) => new FoundationPresenter(f)),
          }),
      ),
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const output = await this.getTower.execute({ id });
    return new TowerPresenter({
      ...output,
      foundations: output.foundations.map((f) => new FoundationPresenter(f)),
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTowerDto) {
    const output = await this.updateTower.execute({ id, ...dto });
    return new TowerPresenter({
      ...output,
      foundations: output.foundations.map((f) => new FoundationPresenter(f)),
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteTower.execute({ id });
  }
}

