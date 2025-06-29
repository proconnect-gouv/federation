import { Response } from 'express';

import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { EventBus } from '@nestjs/cqrs';
import { RpcException } from '@nestjs/microservices';

import { ApiErrorMessage, ApiErrorParams } from '@fc/app';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { OidcProviderNoWrapperException } from '@fc/oidc-provider/exceptions/oidc-provider-no-wrapper.exception';

import { ExceptionsConfig } from '../dto';
import { BaseException } from '../exceptions/base.exception';
import { getClass, getCode, getStackTraceArray } from '../helpers';

@Catch()
export abstract class FcBaseExceptionFilter extends BaseExceptionFilter {
  constructor(
    protected readonly config: ConfigService,
    protected readonly logger: LoggerService,
    protected readonly eventBus: EventBus,
  ) {
    super();
  }

  protected getParams(
    exception: BaseException,
    message: ApiErrorMessage,
    res: Response,
  ): ApiErrorParams {
    const exceptionParam: ApiErrorParams = {
      exception,
      res,
      error: message,
      httpResponseCode: this.getHttpStatus(exception),
      dictionary: {},
    };

    return exceptionParam;
  }

  // eslint-disable-next-line complexity
  protected getHttpStatus(
    exception: BaseException,
    defaultStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): HttpStatus {
    if (exception instanceof OidcProviderNoWrapperException) {
      return (
        exception.originalError?.status ||
        exception.originalError?.statusCode ||
        defaultStatus
      );
    }
    // Yes this checks seems redundant, it's a belt and suspenders situation
    if (exception instanceof BaseException) {
      return exception.status || exception.statusCode;
    } else return defaultStatus;
  }

  protected logException(
    code: string,
    id: string,
    exception: BaseException,
  ): void {
    const exceptionConstructor = getClass(exception);

    const exceptionObject = {
      code,
      id,
      msg: exceptionConstructor.UI,
      originalError: exception.originalError,
      reason: exception.log,
      stackTrace: getStackTraceArray(exception),
      type: exception.constructor.name,
      statusCode: exception.statusCode,
    };

    this.logger.err(exceptionObject);
  }

  // eslint-disable-next-line complexity
  protected getExceptionCodeFor<T extends BaseException | Error>(
    exception?: T,
  ): string {
    const { prefix } = this.config.get<ExceptionsConfig>('Exceptions');
    let errorCode = '';

    if (exception instanceof OidcProviderNoWrapperException) {
      return exception.originalError.constructor.name;
    }

    if (exception instanceof BaseException) {
      return getCode(exception.scope, exception.code, prefix);
    }

    if (exception instanceof HttpException) {
      errorCode = getCode(0, exception.getStatus(), prefix);
    } else if (exception instanceof RpcException) {
      errorCode = getCode(0, 0, prefix);
    }

    return errorCode;
  }
}
