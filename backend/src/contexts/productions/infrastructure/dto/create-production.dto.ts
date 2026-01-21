import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_PRODUCTION } from '@prisma/client';
import { ArrayUnique, IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProductionDto {
  @ApiPropertyOptional({ enum: STATUS_PRODUCTION, default: STATUS_PRODUCTION.EXECUTED })
  @IsOptional()
  @IsEnum(STATUS_PRODUCTION)
  status?: STATUS_PRODUCTION;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ name: 'start_time' })
  @IsOptional()
  @IsDateString()
  start_time?: string;

  @ApiPropertyOptional({ name: 'final_time' })
  @IsOptional()
  @IsDateString()
  final_time?: string;

  @ApiProperty({ name: 'task_id' })
  @IsUUID()
  task_id!: string;

  @ApiPropertyOptional({ isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  teams?: string[];

  @ApiPropertyOptional({ isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  towers?: string[];

  @ApiProperty()
  @IsUUID()
  work_id!: string;
}

