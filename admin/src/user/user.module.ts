import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import generatePassword from "generate-password";
import { LoggerService } from "../logger/logger.service";
import { Password } from "./password.sql.entity";
import { UserService } from "./user.service";
import { User } from "./user.sql.entity";

const generatePasswordProvider = {
  provide: "generatePassword",
  useValue: generatePassword,
};

@Module({
  imports: [TypeOrmModule.forFeature([User, Password])],
  providers: [UserService, generatePasswordProvider, LoggerService],
  exports: [
    UserService,
    TypeOrmModule.forFeature([User]),
    generatePasswordProvider,
  ],
})
export class UserModule {}
