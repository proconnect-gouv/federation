import { HttpStatus } from '@nestjs/common';

import { getCode } from '../helpers/code.helper';

export class BaseException extends Error {
  static DOCUMENTATION: string;
  static UI: string;
  static SCOPE: number;
  static CODE: number | string;
  static LOG_LEVEL: number;
  static HTTP_STATUS_CODE: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

  static ERROR?: string;
  static ERROR_DESCRIPTION?: string;

  public originalError?: Error;
  public log: unknown;
  public statusCode?: number;
  public status?: number;

  public getMessage(): string {
    return this.getClass().UI;
  }

  public getClass(): typeof BaseException {
    return this.constructor as typeof BaseException;
  }

  public getErrorCode(prefix: string): string {
    const exceptionClass = this.getClass();

    const scope = exceptionClass.SCOPE;
    const code = exceptionClass.CODE;

    return getCode(scope, code, prefix);
  }

  public getHttpStatus(_defaultStatus: HttpStatus): HttpStatus {
    const exceptionConstructor = this.getClass();

    return (
      this.status || this.statusCode || exceptionConstructor.HTTP_STATUS_CODE
    );
  }

  constructor(input?: Error | string) {
    let arg: unknown = input;

    if (input instanceof Error) {
      arg = input.message;
    }

    super(arg as string);

    if (input instanceof Error) {
      this.originalError = input;
    }
  }
}
