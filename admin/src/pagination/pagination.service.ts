import { PaginationOptions } from './interface';

export class PaginationService {
  buildPaginationParams(options: PaginationOptions) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const take = limit;

    let where;
    if (options.search) {
      where = { $or: [] };
      for (const field of options.search.fields) {
        where.$or.push({
          [field]: new RegExp(
            options.search.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'i',
          ),
        });
      }
    }

    let order;
    if (options.sort) {
      const { field, direction } = options.sort;
      order = {
        [field]: direction === 'asc' ? 'ASC' : 'DESC',
      };
    } else {
      order = {
        [options.defaultSort.field]:
          options.defaultSort.direction === 'asc' ? 'ASC' : 'DESC',
      };
    }

    const params = { skip, take, where, order };

    return params;
  }
}
