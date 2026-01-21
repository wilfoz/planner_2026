import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TaskPresenter {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  code!: number;

  @ApiProperty()
  @Expose()
  stage!: string;

  @ApiProperty()
  @Expose()
  group!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  unit!: string;

  @ApiProperty({ name: 'created_at' })
  @Expose()
  created_at!: Date;

  constructor(input: { id: string; code: number; stage: string; group: string; name: string; unit: string; created_at: Date }) {
    Object.assign(this, input);
  }
}

