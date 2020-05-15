import { createGlobalProxyAgent } from 'global-agent';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { HttpProxyConfig } from './dto';

@Injectable()
export class HttpProxyService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Set up `gobal-agent`
   * @see https://www.npmjs.com/package/global-agent#runtime-configuration
   */
  onModuleInit() {
    const { httpsProxy } = this.config.get<HttpProxyConfig>('HttpProxy');

    const agent = createGlobalProxyAgent();

    this.logger.debug(`Set up HTTPS proxy to: ${httpsProxy}`);
    agent.HTTPS_PROXY = httpsProxy;
  }
}
