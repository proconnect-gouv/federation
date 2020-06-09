import { BaseExceptionFilter } from '@nestjs/core';
import { LoggerService } from '@fc/logger';
import { Catch } from '@nestjs/common';

@Catch()
export abstract class FcBaseExceptionFilter extends BaseExceptionFilter {
  constructor(protected readonly logger: LoggerService) {
    super();
    this.logger.setContext(this.constructor.name);
  }

  protected getStackTraceArray(exception: any) {
    const { stack = '' } = exception;
    let stackTrace = stack.split('\n');

    if (exception.originalError) {
      const originalStack = exception.originalError.stack || '';
      stackTrace = stackTrace.concat(originalStack.split('\n'));
    }

    // Remove last empty element if any
    if (stackTrace[stackTrace.length - 1] === '') {
      stackTrace.pop();
    }

    return stackTrace;
  }

  protected logException(code, id, exception) {
    const { message, redirect } = exception;
    const stackTrace = this.getStackTraceArray(exception);

    this.logger.warn({
      type: exception.constructor.name,
      code,
      id,
      message,
      stackTrace,
      redirect,
    });
  }
}
