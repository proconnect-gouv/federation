import { Repository } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

export class PaginationService<Entity> {
  public constructor(private readonly repository: Repository<Entity>) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<Entity>> {
    if (options.limit === 0) {
      options.limit = 10;
    }
    return await paginate<Entity>(this.repository, options);
  }
}
