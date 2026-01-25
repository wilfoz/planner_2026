export type SortDir = 'asc' | 'desc';

export type PageInput = {
  page: number;
  per_page: number;
  sort?: string;
  sort_dir?: SortDir;
  filter?: string;
  work_id?: string;
};

export function normalizePageInput(input: Partial<PageInput>): PageInput {
  const page = Math.max(1, Number(input.page ?? 1));
  const per_page = Math.min(100, Math.max(1, Number(input.per_page ?? 10)));
  const sort = input.sort;
  const sort_dir = (input.sort_dir ?? 'desc') as SortDir;
  const filter = input.filter;
  const work_id = input.work_id;

  return { page, per_page, sort, sort_dir, filter, work_id };
}

export function buildPaginationMeta(input: { page: number; per_page: number; total: number }) {
  const last_page = Math.max(1, Math.ceil(input.total / input.per_page));
  return { page: input.page, per_page: input.per_page, total: input.total, last_page };
}

