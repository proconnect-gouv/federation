/* istanbul ignore file */

// Declarative code
import { HttpModule, Module } from '@nestjs/common';

import { HttpProxyService } from './http-proxy.service';

@Module({
  imports: [HttpModule],
  providers: [HttpProxyService],
  exports: [HttpProxyService],
})
export class HttpProxyModule {}
