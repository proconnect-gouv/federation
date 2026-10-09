import { BaseException } from "#libs/exceptions/exceptions/index";

export class CsrfBaseException extends BaseException {
  public scope = 47;
}
