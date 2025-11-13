import { HttpStatus } from '@nestjs/common';

export class BaseException extends Error {
  public code: number | string;
  public scope: number;
  public http_status_code: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  public error?: string;
  public error_description?: string;

  public originalError?: Error;
  public log: unknown;

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
