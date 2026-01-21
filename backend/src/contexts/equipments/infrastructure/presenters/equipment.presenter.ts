import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_EQUIPMENT } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class EquipmentPresenter {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  registration!: string;

  @ApiProperty()
  @Expose()
  model!: string;

  @ApiProperty()
  @Expose()
  manufacturer!: string;

  @ApiProperty({ name: 'license_plate' })
  @Expose()
  license_plate!: string;

  @ApiProperty()
  @Expose()
  provider!: string;

  @ApiProperty({ enum: STATUS_EQUIPMENT })
  @Expose()
  status!: STATUS_EQUIPMENT;

  @ApiPropertyOptional({ name: 'team_id' })
  @Expose()
  team_id?: string | null;

  @ApiProperty({ name: 'created_at' })
  @Expose()
  created_at!: Date;

  constructor(input: {
    id: string;
    registration: string;
    model: string;
    manufacturer: string;
    license_plate: string;
    provider: string;
    status: STATUS_EQUIPMENT;
    team_id?: string | null;
    created_at: Date;
  }) {
    Object.assign(this, input);
  }
}

