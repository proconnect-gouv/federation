import { Loggable, Trackable } from '@fc/error';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
@Loggable(false)
@Trackable()
export class RnippNotFoundMultipleEchoException extends RnippBaseException {
  public readonly code = ErrorCode.NOT_FOUND_MULTIPLE_ECHO;
}
