import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_EMPLOYEE } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class EmployeePresenter {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  registration!: string;

  @ApiProperty({ name: 'full_name' })
  @Expose()
  full_name!: string;

  @ApiProperty()
  @Expose()
  occupation!: string;

  @ApiProperty()
  @Expose()
  leadership!: boolean;

  @ApiProperty({ enum: STATUS_EMPLOYEE })
  @Expose()
  status!: STATUS_EMPLOYEE;

  @ApiPropertyOptional({ name: 'team_id' })
  @Expose()
  team_id?: string | null;

  @ApiProperty({ name: 'created_at' })
  @Expose()
  created_at!: Date;

  constructor(input: {
    id: string;
    registration: string;
    full_name: string;
    occupation: string;
    leadership: boolean;
    status: STATUS_EMPLOYEE;
    team_id?: string | null;
    created_at: Date;
  }) {
    Object.assign(this, input);
  }
}

