import { AuthorizationParameters } from 'openid-client';

import { Inject, Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { throwException } from '@fc/exceptions/helpers';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { atHashFromAccessToken, IOidcClaims } from '@fc/oidc';
import { OidcAcrService } from '@fc/oidc-acr';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import {
  OidcCtx,
  OidcProviderConfig,
  OidcProviderErrorService,
  OidcProviderMiddlewarePattern,
  OidcProviderMiddlewareStep,
  OidcProviderRoutes,
  OidcProviderService,
} from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { SessionNoSessionIdException, SessionService } from '@fc/session';
import { TrackedEventContextInterface, TrackingService } from '@fc/tracking';

import { CoreClaimAmrException } from '../exceptions';

@Injectable()
export class CoreOidcProviderMiddlewareService {
  // Dependency injection can require more than 4 parameters
  // eslint-disable-next-line max-params
  constructor(
    protected readonly logger: LoggerService,
    protected readonly config: ConfigService,
    protected readonly oidcProvider: OidcProviderService,
    protected readonly sessionService: SessionService,
    protected readonly serviceProvider: ServiceProviderAdapterMongoService,
    protected readonly tracking: TrackingService,
    protected readonly oidcErrorService: OidcProviderErrorService,
    protected readonly oidcAcr: OidcAcrService,
    @Inject(IDENTITY_PROVIDER_SERVICE)
    protected readonly identityProvider: IdentityProviderAdapterMongoService,
  ) {}

  protected registerMiddleware(
    step: OidcProviderMiddlewareStep,
    pattern: OidcProviderMiddlewarePattern | OidcProviderRoutes,
    middleware: Function,
  ) {
    this.oidcProvider.registerMiddleware(step, pattern, middleware.bind(this));
  }

  protected koaErrorCatcherMiddlewareFactory(middleware: Function) {
    return async function (ctx: OidcCtx) {
      try {
        await middleware.bind(this)(ctx);
      } catch (e) {
        ctx.oidc['isError'] = true;
        await throwException(e);
      }
    };
  }

  protected getAuthorizationParameters({
    method,
    req,
  }: OidcCtx): AuthorizationParameters {
    const isPostMethod = method === 'POST';
    return isPostMethod ? req.body : req.query;
  }

  protected beforeAuthorizeMiddleware({ req, res }: OidcCtx): void {
    /**
     * Force cookies to be reset to prevent panva from keeping
     * a session open if you use several service provider in a row
     * @param ctx
     */
    this.oidcProvider.clearCookies(res);
    req.headers.cookie = '';
  }

  /**
   * Override authorize request `prompt` parameter.
   * We only support 'login' and 'consent' and enforce those.
   *
   * Overriding the parameters in the request allows us to influence
   * `oidc-provider` behavior and disable all 'SSO' or 'auto login' like features.
   *
   * We make sure that a new call to authorization endpoint will result
   * in a new interaction, whether user agent has a previous session.
   *
   * @param ctx
   * @param overrideValue
   */
  protected overrideAuthorizePrompt(ctx: OidcCtx): void {
    if (!['POST', 'GET'].includes(ctx.method)) {
      this.logger.warning(`Unsupported method "${ctx.method}".`);
      return;
    }

    const { forcedPrompt } =
      this.config.get<OidcProviderConfig>('OidcProvider');
    const overrideValue = forcedPrompt.join(' ');

    /**
     * Support both methods
     * @TODO #137 check what needs to be done if we implement pushedAuthorizationRequests
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/137
     */
    const isPostMethod = ctx.method === 'POST';
    const data = isPostMethod ? ctx.req.body : ctx.query;
    const { prompt: dataPrompt } = data as { prompt: string };
    data.prompt = overrideValue;

    this.logger.info(`Overriding "prompt" with "${data.prompt}"`);
    this.logger.debug({
      originalPrompt: dataPrompt,
      overriddenPrompt: data.prompt,
    });
  }

  protected getEventContext(ctx): TrackedEventContextInterface {
    const interactionId: string =
      this.oidcProvider.getInteractionIdFromCtx(ctx);

    // Retrieve the sessionId from the oidc context (stored in accountId) or from the request
    const sessionId =
      ctx.oidc?.entities?.Account?.accountId || ctx.req.sessionId;

    const eventContext: TrackedEventContextInterface = {
      fc: { interactionId },
      req: ctx.req,
      sessionId,
    };

    return eventContext;
  }

  protected async overrideClaimAmrMiddleware(ctx) {
    const { claims }: { claims: IOidcClaims } = ctx.oidc;

    const amrIsRequested = Object.values(claims)
      .map((claimRequested) => Object.keys(claimRequested))
      .flat()
      .includes('amr');

    if (!amrIsRequested) {
      return;
    }

    const sp = await this.serviceProvider.getById(ctx.oidc.params.client_id);
    const spClaimsAuthorized = sp.claims as Array<string>;
    const spAmrIsAuthorized = spClaimsAuthorized.includes('amr');

    if (!spAmrIsAuthorized) {
      ctx.oidc['isError'] = true;
      throw new CoreClaimAmrException();
    }
  }

  protected async tokenMiddleware(ctx: OidcCtx) {
    const sessionId = this.getSessionId(ctx);
    await this.sessionService.initCache(sessionId);

    const { AccessToken } = ctx.oidc.entities;
    const atHash = atHashFromAccessToken(AccessToken);

    await this.sessionService.setAlias(atHash, sessionId);

    const eventContext = this.getEventContext(ctx);

    const { SP_REQUESTED_FC_TOKEN } = this.tracking.TrackedEventsMap;
    await this.tracking.track(SP_REQUESTED_FC_TOKEN, eventContext);
  }

  protected async userinfoMiddleware(ctx) {
    const sessionId = this.getSessionId(ctx);
    await this.sessionService.initCache(sessionId);

    const eventContext = this.getEventContext(ctx);

    const { SP_REQUESTED_FC_USERINFO } = this.tracking.TrackedEventsMap;
    await this.tracking.track(SP_REQUESTED_FC_USERINFO, eventContext);
  }

  private getSessionId(ctx: OidcCtx): string {
    const { sessionId } = this.getEventContext(ctx);

    if (!sessionId) {
      throw new SessionNoSessionIdException();
    }

    return sessionId;
  }
}
