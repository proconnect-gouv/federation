/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { CryptographyModule } from '@fc/cryptography';
import { IdentityProviderEnvService } from './identity-provider-env.service';

@Module({
  imports: [CryptographyModule],
  providers: [IdentityProviderEnvService],
  exports: [IdentityProviderEnvService, CryptographyModule],
})
export class IdentityProviderEnvModule {}
