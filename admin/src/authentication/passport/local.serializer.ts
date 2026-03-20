import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../user/user.sql.entity";

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
      const user = await this.userRepository.findOneByOrFail({ id: userId });
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
