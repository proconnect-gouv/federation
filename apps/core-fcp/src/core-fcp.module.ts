/* istanbul ignore file */

// Declarative code
import { Module, Global } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OidcProviderModule } from '@fc/oidc-provider';
import { SessionModule } from '@fc/session';
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
import { CoreFcpLoggerModule } from '@fc/core-fcp-logger';
import { OverrideOidcProviderModule } from '@fc/override-oidc-provider';
import { MailerModule } from '@fc/mailer';

const oidcProviderModule = OidcProviderModule.register(
  ServiceProviderService,
  ServiceProviderModule,
);

@Global()
@Module({
  imports: [
    ErrorModule,
    CoreFcpLoggerModule,
    CqrsModule,
    MongooseModule,
    SessionModule,
    RnippModule,
    CryptographyModule,
    AccountModule,
    ServiceProviderModule,
    IdentityProviderModule,
    HttpProxyModule,
    oidcProviderModule,
    OverrideOidcProviderModule.register(oidcProviderModule),
    OidcClientModule.register(IdentityProviderService, IdentityProviderModule),
    MailerModule,
  ],
  controllers: [CoreFcpController],
  providers: [CoreFcpService],
})
export class CoreFcpModule {}
