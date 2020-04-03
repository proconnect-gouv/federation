import { Module } from '@nestjs/common';
import {
  CryptographyGatewayHighService,
  CryptoOverrideService,
  JoseOverrideService,
} from './services';

@Module({
  providers: [
    CryptographyGatewayHighService,
    CryptoOverrideService,
    JoseOverrideService,
  ],
  exports: [CryptographyGatewayHighService],
})
export class CryptographyGatewayHighModule {}
