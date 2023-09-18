import { Injectable } from '@nestjs/common';

import { FeatureHandler, IFeatureHandler } from '@fc/feature-handler';
import { LoggerService } from '@fc/logger-legacy';

import { CoreFcaAuthorizationUrlBaseHandler } from './core-fca-authorization-url-base.handler';

@Injectable()
@FeatureHandler('core-fca-default-authorization-url')
export class CoreFcaDefaultAuthorizationHandler
  extends CoreFcaAuthorizationUrlBaseHandler
  implements IFeatureHandler
{
  constructor(protected readonly logger: LoggerService) {
    super(logger);
  }
}
