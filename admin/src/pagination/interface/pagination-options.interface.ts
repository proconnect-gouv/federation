export interface PaginationOptions {
  page: number;
  limit: number;
  search?: { fields: string[]; value: string };
  sort?: { field: string; direction: PaginationSortDirectionType };
  defaultSort: { field: string; direction: PaginationSortDirectionType };
}

export type PaginationSortDirectionType = 'asc' | 'desc';
