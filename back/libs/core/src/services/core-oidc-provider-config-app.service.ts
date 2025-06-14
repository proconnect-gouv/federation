import { Injectable } from '@nestjs/common';

import { AppConfig } from '@fc/app';
import { ConfigService } from '@fc/config';
import { CoreFcaSession } from '@fc/core-fca';
import { LoggerService } from '@fc/logger';
import { OidcClientRoutes, OidcClientService } from '@fc/oidc-client';
import {
  LogoutFormParamsInterface,
  OidcCtx,
  OidcProviderAppConfigLibService,
  OidcProviderErrorService,
} from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { TrackedEventContextInterface, TrackingService } from '@fc/tracking';

import { CoreMissingAtHashException } from '../exceptions';

@Injectable()
export class CoreOidcProviderConfigAppService extends OidcProviderAppConfigLibService {
  // eslint-disable-next-line max-params
  constructor(
    protected readonly logger: LoggerService,
    protected readonly sessionService: SessionService,
    protected readonly errorService: OidcProviderErrorService,
    protected readonly config: ConfigService,
    protected readonly oidcClient: OidcClientService,
    protected readonly tracking: TrackingService,
  ) {
    super(logger, sessionService, errorService, config);
  }

  /**
   * More documentation can be found in oidc-provider repo
   * @see https://github.com/panva/node-oidc-provider/blob/v6.x/docs/README.md#featuresrpinitiatedlogout
   * @TODO #109 Check the behaving of the page when javascript is disabled
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/issues/109
   */
  async logoutSource(ctx: OidcCtx, form: any): Promise<void> {
    this.sessionService.init(ctx.res);

    const sessionId = await this.getSessionId(ctx);

    let session: CoreFcaSession;
    try {
      session =
        await this.sessionService.getDataFromBackend<CoreFcaSession>(sessionId);
    } catch (error) {
      // Session may have been destroyed or expired
      // Render the logout page to let oidc-provider complete the logout flow
      return super.logoutSource(ctx, form);
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
    } = session.User;

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

  private async getSessionId(ctx: OidcCtx): Promise<string> {
    const { oidc } = ctx;
    const alias = oidc.entities?.IdTokenHint?.payload?.at_hash;

    // Check on `typeof` since `oidc-provider` types `at_hash` as `unknown`
    if (typeof alias !== 'string') {
      throw new CoreMissingAtHashException();
    }

    const sessionId = await this.sessionService.getAlias(alias);

    return sessionId;
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
}
