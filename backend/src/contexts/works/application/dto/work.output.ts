
import { ApiProperty } from '@nestjs/swagger';
import { Work } from '@/contexts/works/domain/work.entity';

export class WorkOutput {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  contractor!: string | null;

  @ApiProperty({ nullable: true })
  tension!: number | null;

  @ApiProperty({ nullable: true })
  extension!: number | null;

  @ApiProperty({ nullable: true })
  phases!: number | null;

  @ApiProperty({ nullable: true })
  circuits!: number | null;

  @ApiProperty({ nullable: true })
  lightning_rod!: number | null;

  @ApiProperty({ nullable: true })
  number_of_conductor_cables!: number | null;

  @ApiProperty({ nullable: true })
  start_date!: Date | null;

  @ApiProperty({ nullable: true })
  end_date!: Date | null;

  @ApiProperty()
  states!: string[];

  @ApiProperty()
  createdAt!: Date;
}
