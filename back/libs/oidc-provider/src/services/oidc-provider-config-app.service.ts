import { Response } from 'express';
import {
  Configuration,
  InteractionResults,
  KoaContextWithOIDC,
  Provider,
} from 'oidc-provider';

import { Injectable } from '@nestjs/common';

import { AppConfig } from '@fc/app';
import { ConfigService } from '@fc/config';
import { UserSession } from '@fc/core';
import { Routes } from '@fc/core/enums';
import { generateErrorId } from '@fc/exceptions/helpers';
import { ErrorPageParams } from '@fc/exceptions/types/error-page-params';
import { LoggerService, TrackedEvent } from '@fc/logger';
import { OidcClientService } from '@fc/oidc-client';
import { SessionService } from '@fc/session';

import { LogoutFormParamsInterface, OidcCtx } from '../interfaces';

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
    protected readonly oidcClient: OidcClientService,
  ) {}

  async logoutSource(ctx: OidcCtx, form: any): Promise<void> {
    const sub = ctx.oidc?.session?.accountId;

    let userSession: UserSession;
    try {
      const sessionId = await this.sessionService.getAlias(sub);

      await this.sessionService.initCache(sessionId);

      userSession = this.sessionService.get<UserSession>('User');
    } catch (error) {
      // Session may have been destroyed or expired
      // Render the logout page to let oidc-provider complete the logout flow
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

      return;
    }

    /**
     * Save to current session minimal informations to:
     * - allow logout
     * - keep track according to legal requirements
     */
    const {
      browsingSessionId,
      reusesActiveSession,
      interactionId,
      idpId,
      idpName,
      idpLabel,
      idpAcr,
      idpIdToken,
      idpIdentity,
      spEssentialAcr,
      spId,
      spName,
    } = userSession;

    this.sessionService.set('User', {
      browsingSessionId,
      reusesActiveSession,
      interactionId,
      idpId,
      idpName,
      idpLabel,
      idpAcr,
      idpIdToken,
      idpIdentity: { sub: idpIdentity.sub },
      spEssentialAcr,
      spId,
      spName,
    });

    const params = await this.getLogoutParams(idpId);

    this.logger.track(TrackedEvent.SP_REQUESTED_LOGOUT);

    await this.logoutFormSessionDestroy(ctx, form, params);
  }

  private async getLogoutParams(
    idpId: string,
  ): Promise<LogoutFormParamsInterface> {
    const { urlPrefix } = this.config.get<AppConfig>('App');

    const hasIdpLogoutUrl = await this.hasIdpLogoutUrl(idpId);

    if (hasIdpLogoutUrl) {
      return {
        method: 'POST',
        uri: `${urlPrefix}${Routes.DISCONNECT_FROM_IDP}`,
        title: 'Déconnexion du FI',
      };
    }

    return {
      method: 'GET',
      uri: `${urlPrefix}${Routes.CLIENT_LOGOUT_CALLBACK}`,
      title: 'Déconnexion FC',
    };
  }

  private async hasIdpLogoutUrl(idpId: string): Promise<boolean> {
    if (!idpId) {
      return false;
    }

    return await this.oidcClient.hasEndSessionUrl(idpId);
  }

  postLogoutSuccessSource(ctx: KoaContextWithOIDC) {
    ctx.body = `<!DOCTYPE html>
        <head>
          <title>Déconnexion</title>
        </head>
        <body>
          <p>Vous êtes bien déconnecté, vous pouvez fermer votre navigateur.</p>
        </body>
        </html>`;
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

  async logoutFormSessionDestroy(
    ctx: OidcCtx,
    form: any,
    { method, uri, title }: LogoutFormParamsInterface,
  ): Promise<void> {
    this.sessionService.set('User', 'oidcProviderLogoutForm', form);
    await this.sessionService.commit();

    ctx.body = `<!DOCTYPE html>
      <head>
        <title>${title}</title>
      </head>
      <body>
        <form method="${method}" action="${uri}">
        </form>
        <script>
          var form = document.forms[0];
          form.submit();
        </script>
      </body>
    </html>`;
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
