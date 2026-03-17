import { Module } from "@nestjs/common";
import { ConsoleModule } from "nestjs-console";
import { TotpService } from "../authentication/totp/totp.service";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { CliService } from "./cli.service";

@Module({
  imports: [ConsoleModule, UserModule],
  providers: [CliService, UserService, TotpService],
  exports: [CliService],
})
export class CliModule {}
