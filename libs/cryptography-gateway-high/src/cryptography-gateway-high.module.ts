import { Module, Global } from '@nestjs/common';
import { CryptographyGatewayHighService } from './cryptography-gateway-high.service';

@Global()
@Module({
  providers: [CryptographyGatewayHighService],
  exports: [CryptographyGatewayHighService],
})
export class CryptographyGatewayHighModule {}
