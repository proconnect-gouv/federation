import { HttpStatus } from "@nestjs/common";

export class BaseException extends Error {
  public code!: number | string;
  public scope!: number;
  public http_status_code: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  public error?: string;
  public error_description?: string;

  public crispLink?: string;

  public originalError?: Error;
  public log: unknown;

  constructor(input?: Error | string) {
    if (input instanceof Error) {
      super(input.message, { cause: input });
      this.originalError = input;
    } else {
      super(input);
    }
  }
}
