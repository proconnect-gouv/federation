import { Loggable, Trackable } from '@fc/error';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
@Loggable(false)
@Trackable()
export class RnippDeceasedException extends RnippBaseException {
  public readonly code = ErrorCode.DECEASED;
}
