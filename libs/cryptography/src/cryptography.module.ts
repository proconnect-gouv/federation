import { Module } from '@nestjs/common';
import {
  CryptographyService,
  CryptoOverrideService,
  JoseOverrideService,
} from './services';

@Module({
  providers: [CryptographyService,  CryptoOverrideService,
    JoseOverrideService,],
  exports: [CryptographyService],
})
export class CryptographyModule {}

