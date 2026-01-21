
import { ApiProperty } from '@nestjs/swagger';
import { Work } from '@/contexts/works/domain/work.entity';

export class WorkOutput {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  tension!: string | null;

  @ApiProperty({ nullable: true })
  extension!: string | null;

  @ApiProperty({ nullable: true })
  start_date!: Date | null;

  @ApiProperty({ nullable: true })
  end_date!: Date | null;

  @ApiProperty()
  createdAt!: Date;
}
