import { BaseException } from '@fc/exceptions/exceptions';

export class CsrfBaseException extends BaseException {
  public scope = 47;
}
