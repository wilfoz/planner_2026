import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFoundationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  project?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  revision?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ name: 'excavation_volume' })
  @IsOptional()
  @IsNumber()
  excavation_volume?: number;

  @ApiPropertyOptional({ name: 'concrete_volume' })
  @IsOptional()
  @IsNumber()
  concrete_volume?: number;

  @ApiPropertyOptional({ name: 'backfill_volume' })
  @IsOptional()
  @IsNumber()
  backfill_volume?: number;

  @ApiPropertyOptional({ name: 'steel_volume' })
  @IsOptional()
  @IsNumber()
  steel_volume?: number;
}

