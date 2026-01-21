import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaPresenter {
  @ApiProperty()
  page: number;

  @ApiProperty({ name: 'per_page' })
  per_page: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ name: 'last_page' })
  last_page: number;

  constructor(input: { page: number; per_page: number; total: number; last_page: number }) {
    this.page = input.page;
    this.per_page = input.per_page;
    this.total = input.total;
    this.last_page = input.last_page;
  }
}

export class CollectionPresenter<T> {
  @ApiProperty({ type: PaginationMetaPresenter })
  meta: PaginationMetaPresenter;

  @ApiProperty({ isArray: true })
  data: T[];

  constructor(input: { meta: PaginationMetaPresenter; data: T[] }) {
    this.meta = input.meta;
    this.data = input.data;
  }
}

