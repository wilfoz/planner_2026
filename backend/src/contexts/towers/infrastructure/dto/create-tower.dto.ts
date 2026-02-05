import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class CoordinatesDto {
  @ApiProperty()
  @IsNumber()
  lat!: number;

  @ApiProperty()
  @IsNumber()
  lng!: number;

  @ApiProperty()
  @IsNumber()
  altitude!: number;
}

export class CreateTowerDto {
  @ApiProperty()
  @IsInt()
  code!: number;

  @ApiProperty({ description: 'Tower number', name: 'tower_number' })
  @IsString()
  tower_number!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiProperty({ type: CoordinatesDto })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates!: CoordinatesDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  embargo?: string;

  @ApiPropertyOptional({ isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  foundations?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deflection?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  structureType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty()
  @IsUUID()
  work_id!: string;
}

