
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsNotEmpty, IsNumber, IsInt } from 'class-validator';

export class CreateWorkDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

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
