import { Module } from '@nestjs/common';
import { CryptographyGatewayHighService } from './cryptography-gateway-high.service';

@Module({
  providers: [CryptographyGatewayHighService],
  exports: [CryptographyGatewayHighService],
})
export class CryptographyGatewayHighModule {}
