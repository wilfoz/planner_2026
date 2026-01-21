import { ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_PRODUCTION } from '@prisma/client';
import { ArrayUnique, IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateProductionDto {
  @ApiPropertyOptional({ enum: STATUS_PRODUCTION })
  @IsOptional()
  @IsEnum(STATUS_PRODUCTION)
  status?: STATUS_PRODUCTION;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string | null;

  @ApiPropertyOptional({ name: 'start_time' })
  @IsOptional()
  @IsDateString()
  start_time?: string | null;

  @ApiPropertyOptional({ name: 'final_time' })
  @IsOptional()
  @IsDateString()
  final_time?: string | null;

  @ApiPropertyOptional({ name: 'task_id' })
  @IsOptional()
  @IsUUID()
  task_id?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  work_id?: string;
}

