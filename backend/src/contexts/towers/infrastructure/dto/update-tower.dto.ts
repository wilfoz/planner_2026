import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CoordinatesDto } from '@/contexts/towers/infrastructure/dto/create-tower.dto';

export class UpdateTowerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  code?: number;

  @ApiPropertyOptional({ name: 'tower_number' })
  @IsOptional()
  @IsString()
  tower_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ type: CoordinatesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  distance?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  embargo?: string | null;

  @ApiPropertyOptional({ isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  foundations?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deflection?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  structureType?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  work_id?: string;
}

