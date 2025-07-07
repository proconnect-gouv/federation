import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [UserModule, AuthenticationModule, LoggerModule],
  exports: [UserModule, AuthenticationModule, LoggerModule],
})
export class SharedModule {}
