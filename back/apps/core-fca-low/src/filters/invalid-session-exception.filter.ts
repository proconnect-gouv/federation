import { errors } from 'oidc-provider';

import {
  ArgumentsHost,
  Catch,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { HttpExceptionFilter } from '@fc/exceptions';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';
import { OidcProviderSessionNotFoundExceptionFilter } from '@fc/oidc-provider/filters/oidc-provider-session-not-found-exception.filter';
import { SessionService } from '@fc/session';

import { AppConfig } from '../dto';
import { Routes } from '../enums';
import { InvalidSessionException } from '../exceptions/invalid-session.exception';
import SessionNotFound = errors.SessionNotFound;

@Catch(InvalidSessionException)
@Injectable()
export class InvalidSessionExceptionFilter extends HttpExceptionFilter {
  constructor(
    protected readonly config: ConfigService,
    protected readonly session: SessionService,
    protected readonly logger: LoggerService,
    protected readonly oidcProvider: OidcProviderService,
  ) {
    super(config, session, logger);
  }

  async catch(exception: InvalidSessionException, host: ArgumentsHost) {
    this.logger.info({
      code: 'invalid-session-exception',
      message: exception?.message,
    });

    const req = host.switchToHttp().getRequest();
    const res = host.switchToHttp().getResponse();

    try {
      const { uid: interactionId } = await this.oidcProvider.getInteraction(
        req,
        res,
      );

      const { urlPrefix } = this.config.get<AppConfig>('App');
      const url = `${urlPrefix}${Routes.INTERACTION.replace(
        ':uid',
        interactionId,
      )}`;

      return res.redirect(url);
    } catch (error) {
      if (error instanceof SessionNotFound) {
        return new OidcProviderSessionNotFoundExceptionFilter(
          this.logger,
        ).catch(error, host);
      }

      const wrapped = new InternalServerErrorException(error);

      super.catch(wrapped, host);
    }
  }
}
