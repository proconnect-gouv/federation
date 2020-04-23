import { IdentityBaseException } from '.';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class IdentityNotFoundException extends IdentityBaseException {
  public readonly code = ErrorCode.NOT_FOUND;
  public message = 'Identity not found';
}
