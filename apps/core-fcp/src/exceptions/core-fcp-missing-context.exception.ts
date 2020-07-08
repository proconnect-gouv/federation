import { CoreFcpBaseException } from './core-fcp-base.exception';
import { ErrorCode } from '../enums';

export class CoreFcpMissingContext extends CoreFcpBaseException {
  code = ErrorCode.MISSING_CONTEXT;

  constructor(field: string) {
    super(`Missing information in context: ${field}`);
  }
}
