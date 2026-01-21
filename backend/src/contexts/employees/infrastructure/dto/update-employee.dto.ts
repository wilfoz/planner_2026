import { ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_EMPLOYEE } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateEmployeeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registration?: string;

  @ApiPropertyOptional({ name: 'full_name' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  leadership?: boolean;

  @ApiPropertyOptional({ enum: STATUS_EMPLOYEE })
  @IsOptional()
  @IsEnum(STATUS_EMPLOYEE)
  status?: STATUS_EMPLOYEE;

  @ApiPropertyOptional({ name: 'team_id' })
  @IsOptional()
  @IsUUID()
  team_id?: string;
}

