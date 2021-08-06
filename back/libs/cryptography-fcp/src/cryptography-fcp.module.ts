import { CryptographyFcpService } from './cryptography-fcp.service';
import { CryptographyService } from '@fc/cryptography';

import { Module } from '@nestjs/common';

@Module({
  imports: [CryptographyService],
  providers: [CryptographyFcpService, CryptographyService],
  exports: [CryptographyFcpService],
})
export class CryptographyFcpModule {}
