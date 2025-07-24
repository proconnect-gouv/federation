import { PaginationOptions } from './interface';

export class PaginationService {
  buildPaginationParams(options: PaginationOptions) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const take = limit;

    let where;
    if (options.search) {
      where = {
        [options.search.field]: new RegExp(options.search.value, 'i'),
      };
    }

    let orderBy;
    if (options.sort) {
      const { field, direction } = options.sort;
      orderBy = {
        [field]: direction === 'asc' ? 'ASC' : 'DESC',
      };
    }

    const params = { skip, take, where, orderBy };

    return params;
  }
}
