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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';

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
import { TowerAccessGuard } from '@/shared/infrastructure/auth/guards/tower-access.guard';

@ApiTags('Towers')
@ApiBearerAuth()
@Controller('tower')
export class TowersController {
  constructor(
    private readonly createTower: CreateTowerUseCase,
    private readonly listTowers: ListTowersUseCase,
    private readonly getTower: GetTowerUseCase,
    private readonly updateTower: UpdateTowerUseCase,
    private readonly deleteTower: DeleteTowerUseCase,
  ) { }

  @Post()
  @Roles({ roles: ['ADMIN', 'admin', 'realm:ADMIN', 'realm:admin', 'MANAGER', 'manager', 'realm:MANAGER', 'realm:manager', 'USER', 'user', 'realm:USER', 'realm:user'] })
  @UseGuards(TowerAccessGuard)
  async create(@Body() dto: CreateTowerDto) {
    const output = await this.createTower.execute(dto);
    return new TowerPresenter({
      ...output,
      foundations: output.foundations.map((f) => new FoundationPresenter(f)),
    });
  }

  @Get()
  @Roles({ roles: ['ADMIN', 'admin', 'realm:ADMIN', 'realm:admin', 'MANAGER', 'manager', 'realm:MANAGER', 'realm:manager', 'USER', 'user', 'realm:USER', 'realm:user'] })
  // For List, guard logic is lenient if no work_id. 
  // Should ideally enforce filtering in UseCase similar to Works.
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
  @Roles({ roles: ['ADMIN', 'admin', 'realm:ADMIN', 'realm:admin', 'MANAGER', 'manager', 'realm:MANAGER', 'realm:manager', 'USER', 'user', 'realm:USER', 'realm:user'] })
  @UseGuards(TowerAccessGuard)
  async getById(@Param('id') id: string) {
    const output = await this.getTower.execute({ id });
    return new TowerPresenter({
      ...output,
      foundations: output.foundations.map((f) => new FoundationPresenter(f)),
    });
  }

  @Put(':id')
  @Roles({ roles: ['ADMIN', 'admin', 'realm:ADMIN', 'realm:admin', 'MANAGER', 'manager', 'realm:MANAGER', 'realm:manager', 'USER', 'user', 'realm:USER', 'realm:user'] })
  @UseGuards(TowerAccessGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateTowerDto) {
    const output = await this.updateTower.execute({ id, ...dto });
    return new TowerPresenter({
      ...output,
      foundations: output.foundations.map((f) => new FoundationPresenter(f)),
    });
  }

  @Delete(':id')
  @Roles({ roles: ['ADMIN', 'admin', 'realm:ADMIN', 'realm:admin', 'MANAGER', 'manager', 'realm:MANAGER', 'realm:manager', 'USER', 'user', 'realm:USER', 'realm:user'] })
  @UseGuards(TowerAccessGuard)
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteTower.execute({ id });
  }
}

