import { FcException } from '@fc/error';

// declarative code
// istanbul ignore next line
export class OidcClientBaseException extends FcException {
  public readonly scope = 2;
}
