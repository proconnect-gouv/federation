import { Response } from 'express';

import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { httpErrorDisplays } from '../config/http-error-display';
import { ExceptionsConfig } from '../dto';
import { generateErrorId, getCode, getStackTraceArray } from '../helpers';
import { ErrorPageParams } from '../types/error-page-params';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter<HttpException> {
  constructor(
    protected readonly config: ConfigService,
    protected readonly session: SessionService,
    protected readonly logger: LoggerService,
  ) {
    super();
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();

    const code = this.getExceptionCodeFor(exception);
    const id = generateErrorId();
    let message = exception.message;

    if (exception instanceof BadRequestException) {
      const badRequestResponse = exception.getResponse() as {
        message: string[];
      };

      message = badRequestResponse.message.join(', ');
    }

    this.logException(code, id, message, exception);

    this.errorOutput({
      error: { code, id, message },
      exception,
      res,
    });
  }

  protected getExceptionCodeFor(exception: HttpException): string {
    const { prefix } = this.config.get<ExceptionsConfig>('Exceptions');

    return getCode(0, exception.getStatus(), prefix);
  }

  protected logException(
    code: string,
    id: string,
    message: string,
    exception: HttpException,
  ): void {
    const exceptionObject = {
      code,
      id,
      message,
      originalError: exception,
      stackTrace: getStackTraceArray(exception),
      type: exception.constructor.name,
      statusCode: exception.getStatus(),
    };

    this.logger.error(exceptionObject);
  }

  protected errorOutput({
    error,
    exception,
    res,
  }: {
    error: {
      code: string;
      id: string;
      message: string;
    };
    exception: HttpException;
    res: Response;
  }): void {
    res.status(exception.getStatus());
    const errorPageParams: ErrorPageParams = {
      exceptionDisplay: httpErrorDisplays[exception.getStatus()] || {},
      error,
    };
    res.render('error', errorPageParams);
  }
}
