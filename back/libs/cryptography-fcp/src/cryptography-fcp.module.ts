import { Module } from '@nestjs/common';
import { CryptographyFcpService } from './cryptography-fcp.service';

@Module({
  providers: [CryptographyFcpService],
  exports: [CryptographyFcpService],
})
export class CryptographyFcpModule {}
