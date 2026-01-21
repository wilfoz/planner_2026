import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFoundationDto {
  @ApiProperty()
  @IsString()
  project!: string;

  @ApiProperty()
  @IsString()
  revision!: string;

  @ApiProperty()
  @IsString()
  description!: string;

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

