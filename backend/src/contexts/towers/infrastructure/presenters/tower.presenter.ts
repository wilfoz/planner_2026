import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { FoundationPresenter } from '@/contexts/foundations/infrastructure/presenters/foundation.presenter';

@Exclude()
export class TowerPresenter {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  code!: number;

  @ApiProperty({ name: 'tower' })
  @Expose()
  tower!: string;

  @ApiProperty()
  @Expose()
  type!: string;

  @ApiProperty()
  @Expose()
  coordinates!: unknown;

  @ApiPropertyOptional()
  @Expose()
  distance?: number | null;

  @ApiPropertyOptional()
  @Expose()
  height?: number | null;

  @ApiPropertyOptional()
  @Expose()
  weight?: number | null;

  @ApiPropertyOptional()
  @Expose()
  embargo?: string | null;

  @ApiProperty({ isArray: true, type: FoundationPresenter })
  @Expose()
  @Type(() => FoundationPresenter)
  foundations!: FoundationPresenter[];

  @ApiProperty({ name: 'created_at' })
  @Expose()
  created_at!: Date;

  constructor(input: {
    id: string;
    code: number;
    tower: string;
    type: string;
    coordinates: unknown;
    distance?: number | null;
    height?: number | null;
    weight?: number | null;
    embargo?: string | null;
    foundations: FoundationPresenter[];
    created_at: Date;
  }) {
    Object.assign(this, input);
  }
}

