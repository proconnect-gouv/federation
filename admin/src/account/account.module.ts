import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.sql.entity';
import { FormModule } from '../form/form.module';
import { AccountController } from './account.controller';
import { UserModule } from '../user/user.module';
import { AccountService } from './account.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { TotpService } from '../authentication/totp/totp.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),
    FormModule,
    AuthenticationModule,
  ],
  controllers: [AccountController],
  providers: [AccountService, UserService, TotpService],
})
export class AccountModule {}
