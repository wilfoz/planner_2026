import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_EMPLOYEE } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  registration!: string;

  @ApiProperty({ name: 'full_name' })
  @IsString()
  full_name!: string;

  @ApiProperty()
  @IsString()
  occupation!: string;

  @ApiProperty()
  @IsBoolean()
  leadership!: boolean;

  @ApiPropertyOptional({ enum: STATUS_EMPLOYEE, default: STATUS_EMPLOYEE.ACTIVE })
  @IsOptional()
  @IsEnum(STATUS_EMPLOYEE)
  status?: STATUS_EMPLOYEE;

  @ApiPropertyOptional({ name: 'team_id' })
  @IsOptional()
  @IsUUID()
  team_id?: string;
}

