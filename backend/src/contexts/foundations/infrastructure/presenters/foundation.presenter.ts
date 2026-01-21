import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FoundationPresenter {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  project!: string;

  @ApiProperty()
  @Expose()
  revision!: string;

  @ApiProperty()
  @Expose()
  description!: string;

  @ApiPropertyOptional({ name: 'excavation_volume' })
  @Expose()
  excavation_volume?: number | null;

  @ApiPropertyOptional({ name: 'concrete_volume' })
  @Expose()
  concrete_volume?: number | null;

  @ApiPropertyOptional({ name: 'backfill_volume' })
  @Expose()
  backfill_volume?: number | null;

  @ApiPropertyOptional({ name: 'steel_volume' })
  @Expose()
  steel_volume?: number | null;

  @ApiProperty({ name: 'created_at' })
  @Expose()
  created_at!: Date;

  constructor(input: {
    id: string;
    project: string;
    revision: string;
    description: string;
    excavation_volume?: number | null;
    concrete_volume?: number | null;
    backfill_volume?: number | null;
    steel_volume?: number | null;
    created_at: Date;
  }) {
    Object.assign(this, input);
  }
}

