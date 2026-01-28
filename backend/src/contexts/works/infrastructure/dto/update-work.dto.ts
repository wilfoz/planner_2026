
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsNumber, IsInt } from 'class-validator';

export class UpdateWorkDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tension?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  extension?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  phases?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  circuits?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  lightning_rod?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  number_of_conductor_cables?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  states?: string[];
}
