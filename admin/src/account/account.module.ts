import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import generatePassword from "generate-password";
import { AuthenticationModule } from "../authentication/authentication.module";
import { TotpService } from "../authentication/totp/totp.service";
import { FormModule } from "../form/form.module";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { User } from "../user/user.sql.entity";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";

const generatePasswordProvider = {
  provide: "generatePassword",
  useValue: generatePassword,
};

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),
    FormModule,
    AuthenticationModule,
  ],
  controllers: [AccountController],
  providers: [
    AccountService,
    UserService,
    TotpService,
    generatePasswordProvider,
  ],
})
export class AccountModule {}
