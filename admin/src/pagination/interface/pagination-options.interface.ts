export interface PaginationOptions {
  page: number;
  limit: number;
  search?: { fields: PaginationFieldSearchType[]; value: string };
  sort?: { field: string; direction: PaginationSortDirectionType };
}

export type PaginationFieldSearchType = {
  name: string;
} & (
  { searchKind: "exactMatch"; pattern: RegExp } | { searchKind: "contains" }
);

export type PaginationSortDirectionType = "asc" | "desc";
