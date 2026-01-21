import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserPresenter {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiPropertyOptional()
  @Expose()
  name?: string | null;

  @ApiProperty()
  @Expose()
  email!: string;

  @ApiProperty({ name: 'created_at' })
  @Expose()
  created_at!: Date;

  constructor(input: { id: string; name?: string | null; email: string; created_at: Date }) {
    this.id = input.id;
    this.name = input.name ?? null;
    this.email = input.email;
    this.created_at = input.created_at;
  }
}

