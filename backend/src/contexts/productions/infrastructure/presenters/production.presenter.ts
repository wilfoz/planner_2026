import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_PRODUCTION } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductionPresenter {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ enum: STATUS_PRODUCTION })
  @Expose()
  status!: STATUS_PRODUCTION;

  @ApiPropertyOptional()
  @Expose()
  comments?: string | null;

  @ApiPropertyOptional({ name: 'start_time' })
  @Expose()
  start_time?: Date | null;

  @ApiPropertyOptional({ name: 'final_time' })
  @Expose()
  final_time?: Date | null;

  @ApiProperty({ name: 'task_id' })
  @Expose()
  task_id!: string;

  @ApiProperty({ isArray: true })
  @Expose()
  teams!: string[];

  @ApiProperty({ isArray: true })
  @Expose()
  towers!: string[];

  @ApiProperty({ name: 'created_at' })
  @Expose()
  created_at!: Date;

  constructor(input: {
    id: string;
    status: STATUS_PRODUCTION;
    comments?: string | null;
    start_time?: Date | null;
    final_time?: Date | null;
    task_id: string;
    teams: string[];
    towers: string[];
    created_at: Date;
  }) {
    Object.assign(this, input);
  }
}

