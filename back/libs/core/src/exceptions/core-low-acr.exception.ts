/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/error';
import { CoreBaseException } from './core-base.exception';
import { ErrorCode } from '../enums';
@Description(
  `Le niveau eIDAS renvoyé par le FI est plus faible que celui demandé par le FS`,
)
export class CoreLowAcrException extends CoreBaseException {
  scope = 2; // identity provider scope
  code = ErrorCode.LOW_ACR;
}
