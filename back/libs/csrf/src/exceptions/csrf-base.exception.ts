import { FcException } from '@fc/exceptions/exceptions';

export class CsrfBaseException extends FcException {
  public scope = 47;
}
