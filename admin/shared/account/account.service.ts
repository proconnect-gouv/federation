import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@fc/shared/user/user.sql.entity';
import { PaginationService } from '@fc/shared/pagination/pagination.service';

@Injectable()
export class AccountService extends PaginationService<User> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }
}
