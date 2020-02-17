import { Module } from '@nestjs/common';
import { OidcProviderService } from './oidc-provider.service';

@Module({
  providers: [OidcProviderService],
  exports: [OidcProviderService],
})
export class OidcProviderModule {}
