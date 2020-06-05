import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  OidcProviderService,
  OidcProviderMiddlewareStep,
  OidcProviderConfig,
  OidcCtx,
  OidcProviderRoutes,
} from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';

import { SessionService } from '@fc/session';
import { CryptographyService } from '@fc/cryptography';
import { AccountBlockedException, AccountService } from '@fc/account';
import { Acr, IOidcIdentity } from '@fc/oidc';
import {
  CoreFcpLowAcrException,
  CoreFcpInvalidAcrException,
} from './exceptions';
import { ConfigService } from '@fc/config';
import { MailerService, MailerConfig } from '@fc/mailer';
import {
  RnippService,
  RnippRequestEvent,
  RnippReceivedValidEvent,
  RnippReceivedInvalidEvent,
  RnippDeceasedException,
  RnippNotFoundMultipleEchoException,
  RnippNotFoundNoEchoException,
  RnippNotFoundSingleEchoException,
  RnippFoundOnlyWithMaritalNameException,
  RnippReceivedDeceasedEvent,
} from '@fc/rnipp';

@Injectable()
export class CoreFcpService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly oidcProvider: OidcProviderService,
    private readonly session: SessionService,
    private readonly rnipp: RnippService,
    private readonly cryptography: CryptographyService,
    private readonly account: AccountService,
    private readonly mailer: MailerService,
    private readonly eventBus: EventBus,
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

    /** Force prompt @see overrideAuthorizePrompt header */
    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.BEFORE,
      OidcProviderRoutes.AUTHORIZATION,
      this.overrideAuthorizePrompt.bind(this, forcedPrompt.join(' ')),
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

    const { interactionId } = req;

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

    // Store the changes in session
    await this.session.store(interactionId, {
      ...session,
      // Delete idp identity from volatile memory
      idpIdentity: null,
      // Save identity for service provider
      spIdentity,
    });
  }

  private async rnippCheck(idpIdentity, req) {
    const { interactionId, ip } = req;
    const eventProperties = { interactionId, ip };
    try {
      this.eventBus.publish(new RnippRequestEvent(eventProperties));
      const rnippIdentity = await this.rnipp.check(idpIdentity);

      this.eventBus.publish(new RnippReceivedValidEvent(eventProperties));
      return rnippIdentity;
    } catch (error) {
      /**
       * Business log Rnipp check failures
       */
      switch (error.constructor) {
        /** Deceased has its own sepcial log */
        case RnippDeceasedException:
          this.eventBus.publish(
            new RnippReceivedDeceasedEvent(eventProperties),
          );
          break;

        /** Other "not found" case are grouped */
        case RnippNotFoundMultipleEchoException:
        case RnippNotFoundNoEchoException:
        case RnippNotFoundSingleEchoException:
        case RnippFoundOnlyWithMaritalNameException:
          this.eventBus.publish(new RnippReceivedInvalidEvent(eventProperties));
          break;
        /**
         * Any other exception is a technical issue
         * @see `@fc/rnipp` exceptions list for more info
         */
      }

      /** Re throw to global exception filter */
      throw error;
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
  private overrideAuthorizePrompt(overrideValue: string, ctx: OidcCtx) {
    this.logger.debug('Override OIDC prompt');

    /**
     * Support both methods
     * @TODO add test once POST is implemented
     * @TODO check what needs to be done if we implement pushedAuthorizationRequests
     */
    switch (ctx.method) {
      case 'GET':
        ctx.query.prompt = overrideValue;
        break;
      case 'POST':
        ctx.body.prompt = overrideValue;
        break;
      default:
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
      throw new CoreFcpInvalidAcrException(
        `Invalid ACR parameters, expected: ${requestedAcr}, received: ${receivedAcr}`,
      );
    }

    if (received < requested) {
      throw new CoreFcpLowAcrException(
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
    const { interactionId } = req;
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
