/* istanbul ignore file */

// Declarative code
import { CryptographyFcaService } from './cryptography-fca.service';

import { Module } from '@nestjs/common';

@Module({
  providers: [CryptographyFcaService],
  exports: [CryptographyFcaService],
})
export class CryptographyFcaModule {}
