
import { ApiProperty } from '@nestjs/swagger';
import { WorkOutput } from '@/contexts/works/application/dto/work.output';

export class WorksListResponseDto {
  @ApiProperty()
  total!: number;

  @ApiProperty({ type: [WorkOutput] })
  items!: WorkOutput[];
}
