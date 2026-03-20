import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import passport from "passport";
import { LoggerService } from "../logger/logger.service";
import { UserModule } from "../user/user.module";
import { AuthenticationFailures } from "./authentication-failures.sql.entity";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { LocalAuthGuard } from "./guard/local.guard";
import { RolesGuard } from "./guard/roles.guard";
import { LocalSerializer } from "./passport/local.serializer";
import { LocalStrategy } from "./passport/local.strategy";
import { TotpService } from "./totp/totp.service";

const authenticationServiceProvider = {
  provide: "IAuthenticationService",
  useClass: AuthenticationService,
};

export const PASSPORT = "Passport";

const passportProvider = {
  provide: PASSPORT,
  useValue: passport,
};

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "local", session: true }),
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
