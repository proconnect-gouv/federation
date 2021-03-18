import { Description } from '@fc/error';
import { CoreBaseException } from './core-base.exception';
import { ErrorCode } from '../enums';
@Description(
  'La page de consentement a été appelée sans avoir effectué les étapes de la cinématique (redirection vers le FS)',
)
export class CoreInvalidCsrfException extends CoreBaseException {
  code = ErrorCode.INVALID_CSRF;
  message = 'Invalid csrf';
}
