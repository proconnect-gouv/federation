import { BaseException } from './base.exception';

export class UnknownException extends BaseException {
  public scope = 0;
  public code = 0;
}
