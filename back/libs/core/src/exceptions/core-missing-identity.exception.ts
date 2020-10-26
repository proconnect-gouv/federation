import { CoreBaseException } from './core-base.exception';
import { ErrorCode } from '../enums';

export class CoreMissingIdentity extends CoreBaseException {
  code = ErrorCode.MISSING_IDENTITY;
  message = 'No identity for SP found in session';
}
