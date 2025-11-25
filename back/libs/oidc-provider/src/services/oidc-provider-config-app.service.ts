import { Response } from 'express';
import {
  Configuration,
  InteractionResults,
  KoaContextWithOIDC,
  Provider,
} from 'oidc-provider';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { UserSession } from '@fc/core';
import { generateErrorId } from '@fc/exceptions/helpers';
import { ErrorPageParams } from '@fc/exceptions/types/error-page-params';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { OidcCtx } from '../interfaces';

/**
 * More documentation can be found in oidc-provider repo
 * @see https://github.com/panva/node-oidc-provider/blob/v7.14.3/docs/README.md
 */
@Injectable()
export class OidcProviderConfigAppService {
  protected provider: Provider;

  constructor(
    protected readonly logger: LoggerService,
    protected readonly sessionService: SessionService,
    protected readonly config: ConfigService,
  ) {}

  logoutSource(ctx: OidcCtx, form: string): void {
    ctx.body = `<!DOCTYPE html>
        <head>
          <title>Déconnexion</title>
        </head>
        <body>
          ${form}
          <script>
            var form = document.forms[0];
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'logout';
            input.value = 'yes';
            form.appendChild(input);
            form.submit();
          </script>
        </body>
      </html>`;
  }

  postLogoutSuccessSource(ctx: KoaContextWithOIDC) {
    // This line magically avoids error 500: ERR_HTTP_HEADERS_SENT
    // TODO investigate why.
    ctx.body = '';

    const res = ctx.res as unknown as Response;
    ctx.type = 'html';
    // the render function is magically available in the koa context
    // as oidc-provider servers is mounted behind the nest server.
    const errorPageParams: ErrorPageParams = {
      exceptionDisplay: {
        title: 'Déconnexion',
        description:
          'Vous êtes bien déconnecté, vous pouvez fermer votre navigateur.',
        illustration: 'connexion',
      },
      error: {},
    };
    ctx.body = res.render('error', errorPageParams);
  }

  async findAccount(
    _ctx: OidcCtx,
    sub: string,
  ): Promise<{ accountId: string; claims: Function }> {
    const sessionId = await this.sessionService.getAlias(sub);
    await this.sessionService.initCache(sessionId);

    const { spIdentity } = this.sessionService.get<UserSession>('User');

    return {
      accountId: spIdentity.sub,
      // eslint-disable-next-line require-await
      async claims() {
        return { ...spIdentity };
      },
    };
  }

  async finishInteraction(
    req: any,
    res: any,
    {
      amr,
      acr,
    }: {
      amr: InteractionResults['login']['amr'];
      acr: InteractionResults['login']['acr'];
    },
  ) {
    const { spIdentity } = this.sessionService.get<UserSession>('User');

    const sessionId = this.sessionService.getId();
    await this.sessionService.setAlias(spIdentity.sub, sessionId);

    const result = {
      login: {
        amr,
        acr,
        accountId: spIdentity.sub,
        ts: Math.floor(Date.now() / 1000),
        remember: false,
      },
      // skip the consent
      consent: {},
    } as InteractionResults;

    return await this.provider.interactionFinished(req, res, result);
  }

  setProvider(provider: Provider): void {
    this.provider = provider;
  }

  renderError: Configuration['renderError'] = (
    ctx: KoaContextWithOIDC,
    { error, error_description },
    err,
  ) => {
    const code = `oidc-provider-rendered-error:${error}`;
    const id = generateErrorId();
    const message = error_description;

    this.logger.error({ code, id, message, originalError: err });

    const res = ctx.res as unknown as Response;
    ctx.type = 'html';
    // the render function is magically available in the koa context
    // as oidc-provider servers is mounted behind the nest server.
    const errorPageParams: ErrorPageParams = {
      exceptionDisplay: {},
      error: { code, id, message },
    };
    ctx.body = res.render('error', errorPageParams);
  };
}
