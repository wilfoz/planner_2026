import { ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_EQUIPMENT } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateEquipmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ name: 'license_plate' })
  @IsOptional()
  @IsString()
  license_plate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ enum: STATUS_EQUIPMENT })
  @IsOptional()
  @IsEnum(STATUS_EQUIPMENT)
  status?: STATUS_EQUIPMENT;

  @ApiPropertyOptional({ name: 'team_id' })
  @IsOptional()
  @IsUUID()
  team_id?: string;
}

