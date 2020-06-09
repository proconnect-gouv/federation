/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { HttpProxyService } from './http-proxy.service';

@Module({
  providers: [HttpProxyService],
  exports: [HttpProxyService],
})
export class HttpProxyModule {}
