import { PassportSerializer } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/user.sql.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalSerializer extends PassportSerializer {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  serializeUser(user: User, done: (error, userId?) => void) {
    done(null, user.id);
  }

  async deserializeUser(userId: string, done: (error, user?) => void) {
    try {
      const user = await this.userRepository.findOneOrFail(userId);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
