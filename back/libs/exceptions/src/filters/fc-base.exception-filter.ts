import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';

import { BaseException } from '@fc/base-exception';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';

import { ExceptionsConfig } from '../dto';
import { getCode, getStackTraceArray } from '../helpers';

@Catch()
export abstract class FcBaseExceptionFilter extends BaseExceptionFilter {
  constructor(
    protected readonly config: ConfigService,
    protected readonly logger: LoggerService,
  ) {
    super();
  }

  protected getHttpStatus(
    exception: BaseException,
    defaultStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): HttpStatus {
    // Yes this checks seems redundant, it's a belt and suspenders situation
    if (exception instanceof BaseException) {
      return exception.http_status_code;
    }

    return defaultStatus;
  }

  protected logException(
    code: string,
    id: string,
    exception: BaseException,
  ): void {
    const exceptionObject = {
      code,
      id,
      msg: exception.ui,
      originalError: exception.originalError,
      reason: exception.log,
      stackTrace: getStackTraceArray(exception),
      type: exception.constructor.name,
      statusCode: exception.http_status_code,
    };

    this.logger.error(exceptionObject);
  }

  // eslint-disable-next-line complexity
  protected getExceptionCodeFor<T extends BaseException | Error>(
    exception?: T,
  ): string {
    const { prefix } = this.config.get<ExceptionsConfig>('Exceptions');
    let errorCode = '';

    if (exception instanceof BaseException) {
      return exception.generic
        ? exception.error
        : getCode(exception.scope, exception.code, prefix);
    }

    if (exception instanceof HttpException) {
      errorCode = getCode(0, exception.getStatus(), prefix);
    } else if (exception instanceof RpcException) {
      errorCode = getCode(0, 0, prefix);
    }

    return errorCode;
  }
}
