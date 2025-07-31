import {
  interactionPolicy,
  InteractionResults,
  KoaContextWithOIDC,
  Provider,
} from 'oidc-provider';

import { Injectable } from '@nestjs/common';

import { AppConfig } from '@fc/app';
import { ConfigService } from '@fc/config';
import { ActiveUserSessionDto, CoreFcaSession, UserSession } from '@fc/core';
import { throwException } from '@fc/exceptions/helpers';
import { LoggerService } from '@fc/logger';
import { OidcClientRoutes, OidcClientService } from '@fc/oidc-client';
import { SessionService } from '@fc/session';
import { TrackedEventContextInterface, TrackingService } from '@fc/tracking';

import { OidcProviderRuntimeException } from '../exceptions';
import { LogoutFormParamsInterface, OidcCtx } from '../interfaces';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { isEmpty } from 'lodash';

/**
 * More documentation can be found in oidc-provider repo
 * @see https://github.com/panva/node-oidc-provider/blob/v7.14.3/docs/README.md
 */
@Injectable()
export class OidcProviderConfigAppService {
  protected provider: Provider;

  // eslint-disable-next-line max-params
  constructor(
    protected readonly logger: LoggerService,
    protected readonly sessionService: SessionService,
    protected readonly config: ConfigService,
    protected readonly oidcClient: OidcClientService,
    protected readonly tracking: TrackingService,
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

    const { req } = ctx;

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

    const trackingContext: TrackedEventContextInterface = { req };
    const { SP_REQUESTED_LOGOUT } = this.tracking.TrackedEventsMap;
    await this.tracking.track(SP_REQUESTED_LOGOUT, trackingContext);

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
        uri: `${urlPrefix}${OidcClientRoutes.DISCONNECT_FROM_IDP}`,
        title: 'Déconnexion du FI',
      };
    }

    return {
      method: 'GET',
      uri: `${urlPrefix}${OidcClientRoutes.CLIENT_LOGOUT_CALLBACK}`,
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
    try {
      const sessionId = await this.sessionService.getAlias(sub);
      // TODO in all the service fetch data directly from redis with getDataFromBackend
      await this.sessionService.initCache(sessionId);

      const { spIdentity } = this.sessionService.get<UserSession>('User');

      return {
        accountId: spIdentity.sub,
        // eslint-disable-next-line require-await
        async claims() {
          return { ...spIdentity };
        },
      };
    } catch (error) {
      // Hacky throw from oidc-provider
      await throwException(error);
    }
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

    try {
      return await this.provider.interactionFinished(req, res, result);
    } catch (error) {
      throw new OidcProviderRuntimeException(error);
    }
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

  getCustomizedPolicy() {
    const { Check, base } = interactionPolicy;

    // fixed in @types/oidc-provider@8.5.0
    // see https://github.com/DefinitelyTyped/DefinitelyTyped/commit/4190e90fd2fa2a7cf845eb57157a97de38636cb6
    type FixedCheckType = typeof Check & {
      REQUEST_PROMPT: true;
      NO_NEED_TO_PROMPT: false;
    };

    const policy = base();

    const loginPrompt = policy.get('login');

    loginPrompt.checks.add(
      new Check(
        'invalid_session_prompt',
        'current End-User session is invalid or incomplete',
        async (ctx) => {
          const sub = ctx.oidc?.session?.accountId;

          let userSession: UserSession;
          try {
            const sessionId = await this.sessionService.getAlias(sub);

            if (!sessionId) {
              return (Check as FixedCheckType).REQUEST_PROMPT;
            }

            userSession =
              await this.sessionService.getDataFromBackend<CoreFcaSession>(
                sessionId,
              )['User'];
          } catch (error) {
            // sessionId or session might not exist in redis
            return (Check as FixedCheckType).REQUEST_PROMPT;
          }

          const activeUserSession = plainToInstance(
            ActiveUserSessionDto,
            userSession,
          );

          const activeSessionValidationErrors =
            await validate(activeUserSession);

          if (!isEmpty(activeSessionValidationErrors)) {
            return (Check as FixedCheckType).REQUEST_PROMPT;
          }

          const idpHint = ctx.oidc?.params?.idp_hint;
          if (idpHint && userSession.spIdentity.idp_id !== idpHint) {
            return (Check as FixedCheckType).REQUEST_PROMPT;
          }

          const loginHint = ctx.oidc?.params?.login_hint;
          if (loginHint && userSession.spIdentity.email !== loginHint) {
            return (Check as FixedCheckType).REQUEST_PROMPT;
          }

          return (Check as FixedCheckType).NO_NEED_TO_PROMPT;
        },
      ),
    );

    return policy;
  }
}
