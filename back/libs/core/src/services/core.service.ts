import { Injectable } from '@nestjs/common';
import {
  OidcProviderService,
  OidcProviderMiddlewareStep,
  OidcProviderConfig,
  OidcCtx,
  OidcProviderRoutes,
  Configuration,
  OidcProviderAuthorizationEvent,
  OidcProviderTokenEvent,
  OidcProviderUserinfoEvent,
} from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';
import { AccountBlockedException, AccountService } from '@fc/account';
import { Acr } from '@fc/oidc';
import { ConfigService } from '@fc/config';
import { ServiceProviderService } from '@fc/service-provider';
import { SessionService } from '@fc/session';
import { IEventContext, TrackingService } from '@fc/tracking';
import { OidcProviderErrorService } from '@fc/oidc-provider/services';
import { CoreLowAcrException, CoreInvalidAcrException } from '../exceptions';
import { AcrValues, pickAcr } from '../transforms';
import { ComputeSp, ComputeIdp } from '../types';

@Injectable()
export class CoreService {
  // Dependency injection can require more than 4 parameters
  // eslint-disable-next-line max-params
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly oidcProvider: OidcProviderService,
    private readonly oidcErrorService: OidcProviderErrorService,
    private readonly account: AccountService,
    private readonly serviceProvider: ServiceProviderService,
    private readonly session: SessionService,
    private readonly tracking: TrackingService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Configure hooks on oidc-provider
   */
  onModuleInit() {
    this.registerMiddlewares();
  }

  private getEventContext(ctx): IEventContext {
    const interactionId: string = this.oidcProvider.getInteractionIdFromCtx(
      ctx,
    );
    const ip: string = this.getIpFromCtx(ctx);

    const eventContext: IEventContext = {
      fc: { interactionId },
      headers: { 'x-forwarded-for': ip },
    };

    return eventContext;
  }

  private registerMiddlewares() {
    const { forcedPrompt } = this.config.get<OidcProviderConfig>(
      'OidcProvider',
    );

    const { acrValues } = this.config.get<Configuration>(
      'OidcProvider.configuration',
    );

    /** Force prompt @see overrideAuthorizePrompt header */
    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.BEFORE,
      OidcProviderRoutes.AUTHORIZATION,
      this.overrideAuthorizePrompt.bind(this, forcedPrompt.join(' ')),
    );

    /** Force Acr values @see overrideAuthorizeAcrValues header */
    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.BEFORE,
      OidcProviderRoutes.AUTHORIZATION,
      this.overrideAuthorizeAcrValues.bind(this, Array.from(acrValues)),
    );

    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.AUTHORIZATION,
      this.authorizationMiddleware.bind(this),
    );

    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.TOKEN,
      this.tokenMiddleware.bind(this),
    );

    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.USERINFO,
      this.userinfoMiddleware.bind(this),
    );
  }

  private async authorizationMiddleware(ctx) {
    /**
     * Abort middleware if authorize is in error
     *
     * We do not want to start a session
     * nor trigger authorization event for invalid requests
     */
    if (ctx.oidc['isError'] === true) {
      return;
    }

    const eventContext = this.getEventContext(ctx);

    const { interactionId } = eventContext.fc;

    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { client_id: spId, acr_values: spAcr } = ctx.oidc.params;

    const { name: spName } = await this.serviceProvider.getById(spId);

    const sessionProperties = {
      spId,
      spAcr,
      spName,
    };
    await this.session.init(ctx.res, interactionId, sessionProperties);

    const authEventContext: IEventContext = {
      ...eventContext,
      spId,
      spAcr,
      spName,
    };
    this.tracking.track(OidcProviderAuthorizationEvent, authEventContext);
  }

  private tokenMiddleware(ctx) {
    try {
      const eventContext = this.getEventContext(ctx);

      this.tracking.track(OidcProviderTokenEvent, eventContext);
    } catch (exception) {
      this.oidcErrorService.throwError(ctx, exception);
    }
  }

  private userinfoMiddleware(ctx) {
    try {
      const eventContext = this.getEventContext(ctx);

      this.tracking.track(OidcProviderUserinfoEvent, eventContext);
    } catch (exception) {
      this.oidcErrorService.throwError(ctx, exception);
    }
  }

  /**
   * Override authorize request `prompt` parameter.
   * We only support 'login' and 'consent' and enforce those.
   *
   * Overriding the parameters in the request allows us to influence
   * `oidc-provider` behavior and disable all 'SSO' or 'auto login' like features.
   *
   * We make sure that a new call to autorization endpoint will result
   * in a new interaction, wether or not user agent has a previous session.
   *
   * @param ctx
   * @param overrideValue
   */
  private overrideAuthorizePrompt(overrideValue: string, ctx: OidcCtx): void {
    this.logger.debug('CoreService.overrideAuthorizePrompt()');
    /**
     * Support both methods
     * @TODO #137 check what needs to be done if we implement pushedAuthorizationRequests
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/137
     */
    switch (ctx.method) {
      case 'GET':
        ctx.query.prompt = overrideValue;
        break;
      case 'POST':
        ctx.req.body.prompt = overrideValue;
        break;
      default:
        this.logger.warn(
          `Unsupported method "${ctx.method} on /authorize endpoint". This should not happen`,
        );
    }
  }

  // Revers ingineering of PANVA library
  getIpFromCtx(ctx): string {
    return ctx.req.headers['x-forwarded-for'];
  }

  private overrideAuthorizeAcrValues(allowed: string[], ctx: OidcCtx): void {
    this.logger.debug('CoreService.overrideAuthorizeAcrValues()');

    if (['POST', 'GET'].includes(ctx.method)) {
      const data = (ctx.method === 'POST'
        ? ctx.req.body
        : ctx.query) as AcrValues;
      const acrValues = data.acr_values.split(/[ ]+/);
      data.acr_values = pickAcr(allowed, acrValues);
    } else {
      this.logger.warn(
        `Unsupported method "${ctx.method} on /authorize endpoint". This should not happen`,
      );
    }
  }

  /**
   * Check if an account exists and is blocked
   * @param identity
   */
  async checkIfAccountIsBlocked(identityHash: string): Promise<void> {
    const accountIsBlocked = await this.account.isBlocked(identityHash);

    if (accountIsBlocked) {
      throw new AccountBlockedException();
    }
  }

  /**
   * Computes federation entry for a given identity and provider id
   *
   * @param providerId
   * @param sub
   * @param entityId?
   */

  private getFederation(providerId: string, sub: string, entityId?: string) {
    const key = entityId || providerId;
    return { [key]: { sub } };
  }

  /**
   * Build and persist current interaction with account service
   * @param {string} spId - id of the Service Provider
   * @param {string} entityId -
   * @param {string} subSp - sub of the Service Provider
   * @param {string} hashSp - hash of the Service Provider
   * @param {string} idpId - id of the Identity Provider
   * @param {string} subIdp - sub of the Identity Provider
   */
  async computeInteraction(
    { spId, entityId, subSp, hashSp }: ComputeSp,
    { idpId, subIdp }: ComputeIdp,
  ) {
    const spFederation = this.getFederation(spId, subSp, entityId);
    const idpFederation = this.getFederation(idpId, subIdp);

    const interaction = {
      // service provider Hash is used as main identity hash
      identityHash: hashSp,
      // federation for each sides
      idpFederation: idpFederation,
      spFederation: spFederation,
      // Set last connection time to now
      lastConnection: new Date(),
    };

    try {
      await this.account.storeInteraction(interaction);
    } catch (error) {
      /**
       * Log a warning but do not throw,
       * since this is not a blocking failure for business.
       *
       * If interaction is not persisted, login can occur anyway.
       * Primary tracing info is keeped by business logs.
       */
      this.logger.warn('Could not persist interaction to database');
    }
  }

  checkIfAcrIsValid(receivedAcr: string, requestedAcr: string) {
    const received = Acr[receivedAcr];
    const requested = Acr[requestedAcr];

    /**
     * @todo renvoyer des exceptions distinctes selon quel ACR est incorrect
     * Vérifier que l'erreur au niveau FS est possible
     */
    if (!received || !requested) {
      throw new CoreInvalidAcrException(
        `Invalid ACR parameters, expected: ${requestedAcr}, received: ${receivedAcr}`,
      );
    }

    if (received < requested) {
      throw new CoreLowAcrException(
        `Low ACR: expected ${requestedAcr} but received ${receivedAcr}`,
      );
    }
  }
}
