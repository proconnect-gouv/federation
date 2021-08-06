/* istanbul ignore file */

// Declarative code
import { CryptographyEidasService } from './cryptography-eidas.service';

import { Module } from '@nestjs/common';

@Module({
  providers: [CryptographyEidasService],
  exports: [CryptographyEidasService],
})
export class CryptographyEidasModule {}
