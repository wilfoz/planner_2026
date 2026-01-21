import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ProductionSnapshotDto {
  @ApiProperty()
  @IsUUID()
  id!: string;
}

