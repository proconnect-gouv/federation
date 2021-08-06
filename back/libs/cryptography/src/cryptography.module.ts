import { CryptographyService } from './cryptography.service';

import { Module } from '@nestjs/common';

@Module({
  providers: [CryptographyService],
  exports: [CryptographyService],
})
export class CryptographyModule {}
