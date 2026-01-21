import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TeamPresenter {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty({ isArray: true })
  @Expose()
  employees!: string[];

  @ApiProperty({ isArray: true })
  @Expose()
  equipments!: string[];

  @ApiProperty({ name: 'created_at' })
  @Expose()
  created_at!: Date;

  constructor(input: { id: string; name: string; employees: string[]; equipments: string[]; created_at: Date }) {
    Object.assign(this, input);
  }
}

