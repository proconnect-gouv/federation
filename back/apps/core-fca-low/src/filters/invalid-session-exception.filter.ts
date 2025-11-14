import { ArgumentsHost, Catch, Injectable } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { SimplifiedInteraction } from '@fc/oidc-acr';
import { OidcProviderService } from '@fc/oidc-provider';

import { AppConfig } from '../dto';
import { Routes } from '../enums';
import { InvalidSessionException } from '../exceptions/invalid-session.exception';

@Catch(InvalidSessionException)
@Injectable()
export class InvalidSessionExceptionFilter extends BaseExceptionFilter<InvalidSessionException> {
  constructor(
    protected readonly config: ConfigService,
    protected readonly logger: LoggerService,
    protected readonly oidcProvider: OidcProviderService,
  ) {
    super();
  }

  async catch(exception: InvalidSessionException, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest();
    const res = host.switchToHttp().getResponse();

    this.logger.info({ code: 'session_invalid_session_exception' });

    // try {
    const { uid: interactionId }: SimplifiedInteraction =
      await this.oidcProvider.getInteraction(req, res);
    // } catch (error) {
    //
    // }

    const { urlPrefix } = this.config.get<AppConfig>('App');
    const url = `${urlPrefix}${Routes.INTERACTION_VERIFY.replace(
      ':uid',
      interactionId,
    )}`;

    return res.redirect(url);
  }
}
