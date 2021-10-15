import { Controller } from '@nestjs/common';

import { LoggerService } from '@fc/logger';

@Controller()
export class BrokerProxyController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }
}
