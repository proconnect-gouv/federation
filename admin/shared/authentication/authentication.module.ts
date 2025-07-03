import * as passport from 'passport';
import { LocalStrategy } from './passport/local.strategy';
import { LocalSerializer } from './passport/local.serializer';
import { TotpService } from './totp/totp.service';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { LocalAuthGuard } from './guard/local.guard';
import { AuthenticationFailures } from './authentication-failures.sql.entity';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserModule } from '../user/user.module';
import { RolesGuard } from './guard/roles.guard';
import { LoggerService } from '@fc/shared/logger/logger.service';

const authenticationServiceProvider = {
  provide: 'IAuthenticationService',
  useClass: AuthenticationService,
};

export const PASSPORT = 'Passport';

const passportProvider = {
  provide: PASSPORT,
  useValue: passport,
};

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'local', session: true }),
    TypeOrmModule.forFeature([AuthenticationFailures]),
    UserModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    authenticationServiceProvider,
    LocalStrategy,
    LocalSerializer,
    LocalAuthGuard,
    RolesGuard,
    passportProvider,
    TotpService,
    LoggerService,
    AuthenticationService,
  ],
  exports: [
    LocalSerializer,
    passportProvider,
    TotpService,
    AuthenticationService,
    UserModule,
  ],
})
export class AuthenticationModule {}
