import { Module } from '@nestjs/common';

import { OidcProviderModule } from '@fc/oidc-provider';
import { IdentityModule, IdentityService } from '@fc/identity';
import {
  ServiceProviderModule,
  ServiceProviderService,
} from '@fc/service-provider';
import {
  IdentityProviderService,
  IdentityProviderModule,
} from '@fc/identity-provider';
import { OidcClientModule } from '@fc/oidc-client';
import { MongooseModule } from '@fc/mongoose';
import { CryptographyModule } from '@fc/cryptography';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from './core-fcp.service';
import { ErrorModule } from '@fc/error';
import { RnippModule } from '@fc/rnipp';
import { AccountModule } from '@fc/account';
import { HttpProxyModule } from '@fc/http-proxy';
import { SessionModule } from '@fc/session';
import { OverrideOidcProviderModule } from '@fc/override-oidc-provider';
import { MailerModule } from '@fc/mailer';

const oidcProviderModule = OidcProviderModule.register(
  IdentityService,
  IdentityModule,
  ServiceProviderService,
  ServiceProviderModule,
);

@Module({
  imports: [
    SessionModule,
    ErrorModule,
    MongooseModule,
    IdentityModule,
    RnippModule,
    CryptographyModule,
    AccountModule,
    IdentityProviderModule,
    HttpProxyModule,
    oidcProviderModule,
    OverrideOidcProviderModule.register(oidcProviderModule),
    OidcClientModule.register(
      IdentityService,
      IdentityModule,
      IdentityProviderService,
      IdentityProviderModule,
    ),
    MailerModule,
  ],
  controllers: [CoreFcpController],
  providers: [CoreFcpService],
})
export class CoreFcpModule {}
