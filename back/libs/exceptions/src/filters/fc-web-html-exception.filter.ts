import { Response } from 'express';

import { ArgumentsHost, Catch, Injectable } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { ExceptionsConfig } from '../dto';
import { BaseException } from '../exceptions/base.exception';
import { CoreFcaBaseException } from '../exceptions/core-fca-base.exception';
import { generateErrorId, getCode, getStackTraceArray } from '../helpers';
import { ErrorPageParams } from '../types';

@Catch(BaseException)
@Injectable()
export class FcWebHtmlExceptionFilter extends BaseExceptionFilter<BaseException> {
  constructor(
    protected readonly config: ConfigService,
    protected readonly session: SessionService,
    protected readonly logger: LoggerService,
  ) {
    super();
  }

  catch(exception: BaseException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();

    const code = this.getExceptionCodeFor(exception);
    const id = generateErrorId();
    const message = exception.message;

    this.logException(code, id, message, exception);

    this.errorOutput({
      error: { code: `${code} (${exception.constructor.name})`, id, message },
      exception,
      res,
    });
  }

  protected getExceptionCodeFor(exception: BaseException): string {
    const { prefix } = this.config.get<ExceptionsConfig>('Exceptions');

    return getCode(exception.scope, exception.code, prefix);
  }

  protected logException<T extends BaseException>(
    code: string,
    id: string,
    message: string,
    exception: T,
  ): void {
    const exceptionObject = {
      code,
      id,
      message,
      originalError: exception.originalError,
      reason: exception.log,
      stackTrace: getStackTraceArray(exception),
      type: exception.constructor.name,
      statusCode: exception.http_status_code,
    };

    this.logger.error(exceptionObject);
  }

  protected errorOutput({
    error,
    exception,
    res,
  }: {
    error: { code: string; id: string; message: string };
    exception: BaseException;
    res: Response;
  }): void {
    const errorPageParams: ErrorPageParams = {
      error,
      exceptionDisplay: {},
    };

    if (exception instanceof CoreFcaBaseException) {
      const {
        contactHref,
        title,
        description,
        displayContact,
        contactMessage,
        illustration,
      } = exception;
      errorPageParams.exceptionDisplay = {
        contactHref: displayContact
          ? contactHref || this.getDefaultContactHref(error)
          : undefined,
        title,
        description,
        displayContact,
        contactMessage,
        illustration,
      };
    }

    res.status(exception.http_status_code);
    res.render('error', errorPageParams);
  }

  protected getDefaultContactHref(error: {
    code: string;
    id: string;
    message: string;
  }): string {
    const notProvided = 'non renseigné';

    const idpName = this.session.get('User', 'idpName') ?? notProvided;
    const spName = this.session.get('User', 'spName') ?? notProvided;

    const errorCode = error.code ?? notProvided;
    const errorId = error.id ?? notProvided;
    const errorMessage = error.message ?? notProvided;

    const defaultEmailBody = encodeURIComponent(`Bonjour,

Je vous signale que j’ai rencontré une erreur sur ProConnect :

- Code de l’erreur : « ${errorCode} » ;
- Identifiant de l’erreur : « ${errorId} » ;
- Message d’erreur : « ${errorMessage} ».

Je souhaitais me connecter à « ${spName} ».

Mon fournisseur d’identité est « ${idpName} ».

Cordialement,
`);
    const defaultEmailSubject = encodeURIComponent(
      `Signaler l’erreur ${errorCode} sur ProConnect`,
    );
    const defaultEmailAddress = encodeURIComponent(
      'support+federation@proconnect.gouv.fr',
    );

    return `mailto:${defaultEmailAddress}?subject=${defaultEmailSubject}&body=${defaultEmailBody}`;
  }
}
