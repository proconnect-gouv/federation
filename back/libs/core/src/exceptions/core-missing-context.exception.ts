import { CoreBaseException } from './core-base.exception';
import { ErrorCode } from '../enums';

export class CoreMissingContextException extends CoreBaseException {
  code = ErrorCode.MISSING_CONTEXT;

  constructor(field: string) {
    super(`Missing information in context: ${field}`);
  }
}
