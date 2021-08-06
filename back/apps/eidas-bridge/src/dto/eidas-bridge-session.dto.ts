/* istanbul ignore file */

// Declarative code
import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';

import { EidasProviderSession } from '@fc/eidas-provider/dto';

export class EidasBridgeSession {
  @IsObject()
  @ValidateNested()
  @Type(() => EidasProviderSession)
  readonly EidasProvider: EidasProviderSession;
}
