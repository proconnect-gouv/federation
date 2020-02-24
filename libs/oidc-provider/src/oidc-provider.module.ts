import { Module } from '@nestjs/common';
import { OidcProviderService } from './oidc-provider.service';
import { OidcProviderController } from './oidc-provider.controller';

@Module({
  providers: [OidcProviderService],
  controllers: [OidcProviderController],
  exports: [OidcProviderService],
})
export class OidcProviderModule {}
