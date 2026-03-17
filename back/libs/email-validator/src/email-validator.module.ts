import { AccountFcaModule } from "@fc/account-fca";
import { ConfigModule } from "@fc/config";
import { IdentityProviderAdapterMongoModule } from "@fc/identity-provider-adapter-mongo";
import { Module } from "@nestjs/common";
import { EmailValidatorService } from "./services";

@Module({
  imports: [IdentityProviderAdapterMongoModule, ConfigModule, AccountFcaModule],
  providers: [EmailValidatorService],
  exports: [EmailValidatorService],
})
export class EmailValidatorModule {}
