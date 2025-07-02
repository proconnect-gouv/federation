import { FcException } from '@fc/exceptions/exceptions';

export class OidcClientBaseException extends FcException {
  public scope = 2;
}
