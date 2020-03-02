import { Module } from '@nestjs/common';
import { CryptographyGatewayLowService } from './cryptography-gateway-low.service';

@Module({
  providers: [CryptographyGatewayLowService],
  exports: [CryptographyGatewayLowService],
})
export class CryptographyGatewayLowModule {}
