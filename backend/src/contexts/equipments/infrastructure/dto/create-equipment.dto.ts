import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_EQUIPMENT } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEquipmentDto {
  @ApiProperty()
  @IsString()
  registration!: string;

  @ApiProperty()
  @IsString()
  model!: string;

  @ApiProperty()
  @IsString()
  manufacturer!: string;

  @ApiProperty({ name: 'license_plate' })
  @IsString()
  license_plate!: string;

  @ApiProperty()
  @IsString()
  provider!: string;

  @ApiPropertyOptional({ enum: STATUS_EQUIPMENT, default: STATUS_EQUIPMENT.ACTIVE })
  @IsOptional()
  @IsEnum(STATUS_EQUIPMENT)
  status?: STATUS_EQUIPMENT;

  @ApiPropertyOptional({ name: 'team_id' })
  @IsOptional()
  @IsUUID()
  team_id?: string;
}

