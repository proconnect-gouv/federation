import { FcException } from '@fc/error';

// declarative code
// istanbul ignore next line
export class IdentityManagementBaseException extends FcException {
  public originalError: Error;
  public readonly scope = 15;
}
