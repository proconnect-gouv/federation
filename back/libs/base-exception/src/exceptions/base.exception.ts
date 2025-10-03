import { HttpStatus } from '@nestjs/common';

export class BaseException extends Error {
  public documentation: string;
  public code: number | string;
  public scope: number;
  public http_status_code: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  public ui: string;
  public generic: boolean = false;
  public error?: string;
  public error_description?: string;

  public originalError?: Error;
  public log: unknown;

  constructor(input?: Error | string, options?: ErrorOptions) {
    if (input instanceof Error) {
      super(input.message, { cause: input });
    } else {
      super(input, options);
    }
  }
}
