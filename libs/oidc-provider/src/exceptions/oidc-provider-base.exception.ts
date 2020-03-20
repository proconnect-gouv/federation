import { FcException } from '@fc/error';

// declarative code
// istanbul ignore next line
export class OidcProviderBaseException extends FcException {
  public readonly scope = 3;
}
