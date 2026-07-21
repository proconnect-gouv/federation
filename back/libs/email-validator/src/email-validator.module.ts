import { AccountFcaModule } from "@fc/account-fca";
import { ConfigModule } from "@fc/config";
import { IdentityProviderAdapter } from "@fc/oidc-client";
import { DynamicModule, Module, Type } from "@nestjs/common";
import { EmailValidatorService } from "./services";

@Module({})
export class EmailValidatorModule {
  static register(
    identityProvider: Type<IdentityProviderAdapter>,
    identityProviderModule,
  ): DynamicModule {
    return {
      module: EmailValidatorModule,
      imports: [identityProviderModule, ConfigModule, AccountFcaModule],
      providers: [
        {
          provide: IdentityProviderAdapter,
          useExisting: identityProvider,
        },
        EmailValidatorService,
      ],
      exports: [EmailValidatorService],
    };
  }
}
