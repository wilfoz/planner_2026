export interface PaginationMeta {
  page: number; // Matches backend "page"
  per_page: number;
  total: number;
  last_page: number;
}

export interface Collection<T> {
  data: T[];
  meta: PaginationMeta;
}
