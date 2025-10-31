import { bootstrap } from 'global-agent';

import { Injectable } from '@nestjs/common';

import { LoggerService } from '@fc/logger';

@Injectable()
export class HttpProxyService {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Set up `global-agent`
   * @see https://www.npmjs.com/package/global-agent#runtime-configuration
   * This applies proxy rules on all libraries
   * that use the NodeJS request library.
   * It silently adds proxy management in all requests in applications.
   */
  onModuleInit() {
    // Instanciate proxy params for Got library and basic NodeJS Request
    // Activate the GLOBAL_AGENT_HTTP(S)_PROXY env variable on proxy settings

    void bootstrap();

    this.logger.info(
      `Set up HTTPS proxy to: ${globalThis['GLOBAL_AGENT'].HTTPS_PROXY}`,
    );
  }
}
