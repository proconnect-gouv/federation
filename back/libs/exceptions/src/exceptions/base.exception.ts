import { HttpStatus } from '@nestjs/common';

export class BaseException extends Error {
  static UI: string;
  static SCOPE: number;
  static LOG_LEVEL: number;
  static HTTP_STATUS_CODE: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

  static ERROR?: string;
  static ERROR_DESCRIPTION?: string;

  // Formerly static fields
  public documentation: string;
  public code: number | string;

  public originalError?: Error;
  public log: unknown;
  public statusCode?: number;
  public status?: number;

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
