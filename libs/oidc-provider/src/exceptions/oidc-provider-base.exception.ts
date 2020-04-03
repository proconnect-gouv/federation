import { FcException } from '@fc/error';

// declarative code
// istanbul ignore next line
export class OidcProviderBaseException extends FcException {
  public originalError: Error;
  public readonly scope = 3;
}
