export interface PaginationOptions {
  page: number;
  limit: number;
  search?: { field: string; value: string };
  sort?: { field: string; direction: PaginationSortDirectionType };
}

export type PaginationSortDirectionType = 'asc' | 'desc';
