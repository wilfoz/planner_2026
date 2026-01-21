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
import { STATUS_EQUIPMENT } from '@prisma/client';

import { CreateEquipmentUseCase } from '@/contexts/equipments/application/usecases/create-equipment.usecase';
import { DeleteEquipmentUseCase } from '@/contexts/equipments/application/usecases/delete-equipment.usecase';
import { GetEquipmentUseCase } from '@/contexts/equipments/application/usecases/get-equipment.usecase';
import { ListEquipmentsUseCase } from '@/contexts/equipments/application/usecases/list-equipments.usecase';
import { UpdateEquipmentUseCase } from '@/contexts/equipments/application/usecases/update-equipment.usecase';
import { CreateEquipmentDto } from '@/contexts/equipments/infrastructure/dto/create-equipment.dto';
import { ListEquipmentsQueryDto } from '@/contexts/equipments/infrastructure/dto/list-equipments.query.dto';
import { UpdateEquipmentDto } from '@/contexts/equipments/infrastructure/dto/update-equipment.dto';
import { EquipmentPresenter } from '@/contexts/equipments/infrastructure/presenters/equipment.presenter';
import { AuthGuard } from '@/shared/infrastructure/auth/auth.guard';
import { CollectionPresenter } from '@/shared/presenters/collection.presenter';

@ApiTags('Equipments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('equipments')
export class EquipmentsController {
  constructor(
    private readonly createEquipment: CreateEquipmentUseCase,
    private readonly listEquipments: ListEquipmentsUseCase,
    private readonly getEquipment: GetEquipmentUseCase,
    private readonly updateEquipment: UpdateEquipmentUseCase,
    private readonly deleteEquipment: DeleteEquipmentUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateEquipmentDto) {
    const output = await this.createEquipment.execute({
      registration: dto.registration,
      model: dto.model,
      manufacturer: dto.manufacturer,
      license_plate: dto.license_plate,
      provider: dto.provider,
      status: dto.status ?? STATUS_EQUIPMENT.ACTIVE,
      team_id: dto.team_id ?? null,
    });
    return new EquipmentPresenter(output);
  }

  @Get()
  async list(@Query() query: ListEquipmentsQueryDto) {
    const result = await this.listEquipments.execute(query);
    return new CollectionPresenter({
      meta: result.meta,
      data: result.data.map((e) => new EquipmentPresenter(e)),
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const output = await this.getEquipment.execute({ id });
    return new EquipmentPresenter(output);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    const output = await this.updateEquipment.execute({ id, ...dto });
    return new EquipmentPresenter(output);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteEquipment.execute({ id });
  }
}

