import { FcException } from '@fc/error';

// declarative code
// istanbul ignore next line
export class RnippBaseException extends FcException {
  public readonly scope = 1;
}
