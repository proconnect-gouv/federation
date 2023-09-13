import { Injectable } from '@nestjs/common';

import { FeatureHandler, IFeatureHandler } from '@fc/feature-handler';
import { LoggerService } from '@fc/logger-legacy';

import { CoreFcaAuthorizationUrlAbstract } from './core-fca-authorization-url.abstract';

@Injectable()
@FeatureHandler('core-fca-default-authorization-url')
export class CoreFcaDefaultAuthorizationParamsHandler
  extends CoreFcaAuthorizationUrlAbstract
  implements IFeatureHandler
{
  constructor(protected readonly logger: LoggerService) {
    super(logger);
  }
}
