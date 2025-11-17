import { errors } from 'oidc-provider';

import { ArgumentsHost, Catch, Injectable } from '@nestjs/common';
import SessionNotFound = errors.SessionNotFound;
import { BaseExceptionFilter } from '@nestjs/core';

import { generateErrorId, getStackTraceArray } from '@fc/exceptions/helpers';
import { ErrorPageParams } from '@fc/exceptions/types/error-page-params';
import { LoggerService } from '@fc/logger';

@Catch(SessionNotFound)
@Injectable()
export class OidcProviderSessionNotFoundExceptionFilter extends BaseExceptionFilter<SessionNotFound> {
  constructor(protected readonly logger: LoggerService) {
    super();
  }

  catch(exception: SessionNotFound, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();

    const code = 'oidc-provider-error:session-not-found';
    const id = generateErrorId();
    const message = exception.error_description;
    const statusCode = 400;

    const errorPageParams: ErrorPageParams = {
      error: {
        code,
        id,
        message,
      },
      exceptionDisplay: {
        description:
          'Nous n’arrivons pas à vous connecter à votre service en ligne pour l’instant. \n' +
          'Fermez cette page et essayez de vous reconnecter depuis le site sur lequel vous étiez.',
      },
    };

    const exceptionObject = {
      code,
      id,
      message,
      originalError: exception,
      stackTrace: getStackTraceArray(exception),
      type: exception.constructor.name,
      statusCode,
    };

    this.logger.error(exceptionObject);

    res.status(statusCode);
    res.render('error', errorPageParams);
  }
}
