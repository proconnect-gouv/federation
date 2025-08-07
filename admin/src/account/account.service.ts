import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.sql.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(params: { limit: number; page: number }) {
    const [items, total] = await this.userRepository.findAndCount({
      take: params.limit,
      skip: (params.page - 1) * params.limit,
    });

    return {
      items,
      total,
    };
  }
}
