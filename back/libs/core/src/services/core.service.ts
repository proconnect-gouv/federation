import { Injectable } from '@nestjs/common';
import {
  OidcProviderService,
  OidcProviderMiddlewareStep,
  OidcProviderConfig,
  OidcCtx,
  OidcProviderRoutes,
  Configuration,
} from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';
import { CryptographyService } from '@fc/cryptography';
import { AccountBlockedException, AccountService } from '@fc/account';
import { Acr, IOidcIdentity } from '@fc/oidc';
import { ConfigService } from '@fc/config';
import { CoreLowAcrException, CoreInvalidAcrException } from '../exceptions';
import { AcrValues, pickAcr } from '../transforms';
import { IdentityGroup, ServiceGroup } from '../types';

@Injectable()
export class CoreService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly oidcProvider: OidcProviderService,
    private readonly cryptography: CryptographyService,
    private readonly account: AccountService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Configure hooks on oidc-provider
   */
  onModuleInit() {
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
  private overrideAuthorizePrompt(overrideValue: string, ctx: OidcCtx) {
    this.logger.debug('Override OIDC prompt');
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
        /**
         * @TODO #167 enhance interface to allow the use of `body` property
         * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/167
         * */
        ctx.req['body'].prompt = overrideValue;
        break;
      default:
        this.logger.warn(
          `Unsupported method "${ctx.method} on /authorize endpoint". This should not happen`,
        );
    }
  }

  private overrideAuthorizeAcrValues(allowed: string[], ctx: OidcCtx) {
    this.logger.debug('Override OIDC Acr Values');

    if (['POST', 'GET'].includes(ctx.method)) {
      const data = (ctx.method === 'POST'
        ? ctx.req['body']
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
  async checkIfAccountIsBlocked(identity: IOidcIdentity): Promise<void> {
    const identityHash = this.cryptography.computeIdentityHash(identity);
    const accountIsBlocked = await this.account.isBlocked(identityHash);

    if (accountIsBlocked) {
      throw new AccountBlockedException();
    }
  }

  /**
   * Computes hash, sub and federation entry for a given identity and provider id
   *
   * @param providerId
   * @param identity
   * @param federationKey?
   */
  private buildInteractionParts(
    providerId: string,
    identity: IOidcIdentity,
    federationKey?: string,
  ) {
    const key = federationKey || providerId;
    const hash = this.cryptography.computeIdentityHash(identity);
    const sub = this.cryptography.computeSubV1(providerId, hash);
    const federation = { [key]: { sub } };

    return { hash, sub, federation };
  }

  /**
   * @todo Découper cette fonction car elle commence à englober plusieurs traitements business
   * Build and persist current interaction with account service
   * @param {Object} idp Identity provider information
   * @param {string} idp.idpId - id of the Identity Provider
   * @param {string} idp.idpIdentity - data from Identity Provider
   * @param {Object} sp Service provider information
   * @param {string} idp.spId - id of the Service Provider
   * @param {string} idp.spIdentity - data to give to Service Provider
   * @param {string} idp.spRef - Reference of Service Provider used to identity
   */
  async computeInteraction(
    { idpId, idpIdentity }: IdentityGroup,
    { spIdentity, spId, spRef }: ServiceGroup,
  ) {
    const spParts = this.buildInteractionParts(spRef, spIdentity, spId);
    const idpParts = this.buildInteractionParts(idpId, idpIdentity);

    const interaction = {
      // service provider Hash is used as main identity hash
      identityHash: spParts.hash,
      // federation for each sides
      idpFederation: idpParts.federation,
      spFederation: spParts.federation,
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

    // Return interaction parts avoid double computation
    return {
      spInteraction: spParts,
      idpInteraction: idpParts,
    };
  }

  checkIfAcrIsValid(receivedAcr: string, requestedAcr: string) {
    const received = Acr[receivedAcr];
    const requested = Acr[requestedAcr];

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
