/* istanbul ignore file */

// Declarative code
import { Module, HttpModule } from '@nestjs/common';
import { HttpProxyService } from './http-proxy.service';

@Module({
  imports: [HttpModule],
  providers: [HttpProxyService],
  exports: [HttpProxyService],
})
export class HttpProxyModule {}
