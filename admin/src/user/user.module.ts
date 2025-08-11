import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.sql.entity';
import { Password } from './password.sql.entity';
import { UserService } from './user.service';
import { LoggerService } from '../logger/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Password])],
  providers: [UserService, LoggerService],
  exports: [UserService, TypeOrmModule.forFeature([User])],
})
export class UserModule {}
