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

import { SessionService } from '@fc/session';
import { CryptographyService } from '@fc/cryptography';
import { AccountBlockedException, AccountService } from '@fc/account';
import { Acr, IOidcIdentity } from '@fc/oidc';
import { ConfigService } from '@fc/config';
import { MailerService, MailerConfig } from '@fc/mailer';
import { TrackingService } from '@fc/tracking';
import {
  RnippService,
  RnippRequestedEvent,
  RnippReceivedValidEvent,
} from '@fc/rnipp';
import { CoreLowAcrException, CoreInvalidAcrException } from '../exceptions';

import { AcrValues, pickAcr } from '../transforms';

@Injectable()
export class CoreService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly oidcProvider: OidcProviderService,
    private readonly session: SessionService,
    private readonly rnipp: RnippService,
    private readonly cryptography: CryptographyService,
    private readonly account: AccountService,
    private readonly mailer: MailerService,
    private readonly tracking: TrackingService,
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
   * Main business manipulations occurs in this method
   *
   * 1. Get infos on current interaction and identity fetched from IdP
   * 2. Check identity against RNIPP
   * 3. Store interaction with account service (long term storage)
   * 4. Store identity with session service (short term storage)
   * 5. Display consent page
   *
   * NB:
   * Identity from identity provider id transmitted to sp.
   *   This is not complient with core v1 / eIDAS low.
   *   We'll see if we make this configurable when we implement low,
   *   `rnippIdentity` is at hand anyway.
   *
   * @param req
   * @param res
   */
  async verify(req) {
    this.logger.debug('getConsent service');

    const { interactionId } = req.fc;

    // Grab informations on interaction and identity
    const session = await this.session.get(interactionId);
    const { idpId, idpIdentity, idpAcr, spId, spAcr } = session;

    // Acr check
    this.checkIfAcrIsValid(idpAcr, spAcr);

    // Identity check and normalization
    const rnippIdentity = await this.rnippCheck(idpIdentity, req);

    await this.checkIfAccountIsBlocked(rnippIdentity);

    // Save interaction to database & get sp's sub to avoid double computation
    const { spInteraction } = await this.storeInteraction(
      idpId,
      idpIdentity, // use identity from IdP for IdP
      spId,
      rnippIdentity, // use identity from RNIPP for SP
    );

    /**
     * Prepare identity that will be retrieved by `oidc-provider`
     * and sent to the SP
     *
     * We need to replace IdP's sub, by our own sub
     */
    const spIdentity = { ...idpIdentity, sub: spInteraction.sub };

    // Delete idp identity from volatile memory but keep the sub for the business logs.
    const idpIdentityReset = { sub: idpIdentity.sub };

    // Store the changes in session
    await this.session.patch(interactionId, {
      // Save idp identity.
      idpIdentity: idpIdentityReset,
      // Save service provider identity.
      spIdentity,
    });
  }

  private async rnippCheck(idpIdentity, req) {
    this.tracking.track(RnippRequestedEvent, req);
    const rnippIdentity = await this.rnipp.check(idpIdentity);
    this.tracking.track(RnippReceivedValidEvent, req);

    return rnippIdentity;
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
  private async checkIfAccountIsBlocked(
    identity: IOidcIdentity,
  ): Promise<void> {
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
   */
  private buildInteractionParts(providerId: string, identity: IOidcIdentity) {
    const hash = this.cryptography.computeIdentityHash(identity);
    const sub = this.cryptography.computeSubV2(hash, providerId);
    const federation = { [providerId]: { sub } };

    return { hash, sub, federation };
  }

  /**
   * Build and persist current interaction with account service
   *
   * @param idpId Identity provider identifier
   * @param idpIdentity Identity object for identity provider's identity hash
   * @param spId Service provider identifier
   * @param spIdentity Identity object for service provider's identity hash
   */
  private async storeInteraction(
    idpId: string,
    idpIdentity: IOidcIdentity,
    spId: string,
    spIdentity: IOidcIdentity,
  ) {
    const spParts = this.buildInteractionParts(spId, spIdentity);
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

  private checkIfAcrIsValid(receivedAcr: string, requestedAcr: string) {
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

  /**
   * Send an email to the authenticated end-user after consent
   * @param req Express req object
   * @param res Express res object
   */
  async sendAuthenticationMail(req) {
    const { from } = this.config.get<MailerConfig>('Mailer');
    const { interactionId } = req.fc;
    const { spName, idpName, spIdentity } = await this.session.get(
      interactionId,
    );

    this.logger.debug('Sending authentication mail');
    this.mailer.send({
      from,
      to: [
        {
          email: spIdentity.email,
          name: `${spIdentity.given_name} ${spIdentity.family_name}`,
        },
      ],
      subject: `Connexion depuis FranceConnect sur ${spName}`,
      body: `Connexion établie via ${idpName} !`,
    });
  }
}
