/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/error';
import { CoreBaseException } from './core-base.exception';
import { ErrorCode } from '../enums';

@Description(
  `Le niveau eidas demandé par le FS ou renvoyé par le FI n'est pas supporté par la plateforme`,
)
export class CoreInvalidAcrException extends CoreBaseException {
  scope = 2; // identity provider scope
  code = ErrorCode.INVALID_ACR;
  message = 'Invalid ACR';
}
