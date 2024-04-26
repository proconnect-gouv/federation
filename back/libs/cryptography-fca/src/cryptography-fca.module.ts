/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';

import { CryptographyModule, CryptographyService } from '@fc/cryptography';

@Module({
  imports: [CryptographyModule],
  providers: [CryptographyService],
  exports: [],
})
export class CryptographyFcaModule {}
