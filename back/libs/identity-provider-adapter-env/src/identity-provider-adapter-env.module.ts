/* istanbul ignore file */

// Declarative code
import { CryptographyModule } from '@fc/cryptography';

import { Module } from '@nestjs/common';

import { IdentityProviderAdapterEnvService } from './identity-provider-adapter-env.service';

@Module({
  imports: [CryptographyModule],
  providers: [IdentityProviderAdapterEnvService],
  exports: [IdentityProviderAdapterEnvService, CryptographyModule],
})
export class IdentityProviderAdapterEnvModule {}
