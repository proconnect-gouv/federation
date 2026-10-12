import { AccountFcaModule } from "#libs/account-fca";
import { ConfigModule } from "#libs/config";
import { IdentityProviderAdapterMongoModule } from "#libs/identity-provider-adapter-mongo";
import { Module } from "@nestjs/common";
import { EmailValidatorService } from "./services";

@Module({
  imports: [IdentityProviderAdapterMongoModule, ConfigModule, AccountFcaModule],
  providers: [EmailValidatorService],
  exports: [EmailValidatorService],
})
export class EmailValidatorModule {}
