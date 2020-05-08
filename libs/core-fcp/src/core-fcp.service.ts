import { Injectable } from '@nestjs/common';
import { OidcProviderService } from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';
import { RnippService } from '@fc/rnipp';
import { IdentityService, IIdentity } from '@fc/identity';
import { CryptographyService } from '@fc/cryptography';
import { AccountBlockedException, AccountService } from '@fc/account';
import { Acr } from '@fc/oidc';
import {
  CoreFcpLowAcrException,
  CoreFcpInvalidAcrException,
} from './exceptions';

@Injectable()
export class CoreFcpService {
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identity: IdentityService,
    private readonly rnipp: RnippService,
    private readonly cryptography: CryptographyService,
    private readonly account: AccountService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Configure hooks on oidc-provider
   *
   * We do not need this feature yet, left for documentation:
   *
   * OidcProviderMiddlewareStep and OidcProviderMiddlewarePattern
   * are imported from '@fc/oidc-provider'
   *
   * onModuleInit() {
   *   this.oidcProvider.registerMiddleware(
   *     OidcProviderMiddlewareStep.AFTER,
   *     OidcProviderMiddlewarePattern.TOKEN,
   *     () => {
   *       console.log(
   *         'Exemple de middleware initialisé depuis le module business !!',
   *       );
   *       console.log('Voir libs/core-fcp/core-fcp.service.ts');
   *     },
   *   );
   * }
   */

  /**
   * Main business manipulations occurs in this method
   *
   * 1. Get infos on current interaction and identity fetched from IdP
   * 2. Check identity against RNIPP
   * 3. Store interaction with account service (long term storage)
   * 4. Store identity with identity service (short term storage)
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
  async getConsent(req, res) {
    this.logger.debug('getConsent service');

    // Grab informations on interaction and identity
    const { interactionId, spId, spAcr } = await this.getInteractionInfo(
      req,
      res,
    );
    const { idpId, idpIdentity, idpAcr } = await this.getIdentityInfo(
      interactionId,
    );

    // Acr check
    await this.checkIfAcrIsValid(idpAcr, spAcr);

    // Identity check and normalization
    const rnippIdentity = await this.rnipp.check(idpIdentity);

    await this.checkIfAccountIsBlocked(rnippIdentity);

    // Save interaction to database & get sp's sub to avoid double computation
    const { spInteraction } = await this.storeInteraction(
      idpId,
      idpIdentity, // use identity from IdP for IdP
      spId,
      rnippIdentity, // use identity from RNIPP for SP
    );

    // Delete original identity from volatile memory
    await this.identity.deleteIdpIdentity(interactionId);

    // Save identity to volatile memory for service provider.
    await this.storeIdentityForServiceProvider(
      interactionId,
      // Identity from identity provider id transmitted to sp.
      idpIdentity,
      // Service provider's sub is transmitted to sp (obviously)
      spInteraction.sub,
    );

    // Return data to display on UI
    return {
      interactionId,
      identity: idpIdentity,
    };
  }

  /**
   * Check if an account exists and is blocked
   * @param identity
   */
  private async checkIfAccountIsBlocked(identity: IIdentity): Promise<void> {
    const identityHash = this.cryptography.computeIdentityHash(identity);
    const accountIsBlocked = await this.account.isBlocked(identityHash);

    if (accountIsBlocked) {
      throw new AccountBlockedException();
    }
  }

  /**
   * Service Provider
   * @TODO Check SP is active / available, throw if not
   */
  private async getInteractionInfo(req, res): Promise<any> {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);

    return {
      spId: params.client_id,
      interactionId: uid,
      spAcr: params.acr_values,
    };
  }

  private async getIdentityInfo(interactionId) {
    const { identity, meta } = await this.identity.getIdpIdentity(
      interactionId,
    );

    return {
      idpId: meta.identityProviderId,
      idpAcr: meta.acr,
      idpIdentity: identity,
    };
  }

  /**
   * Computes hash, sub and federation entry for a given identity and provider id
   *
   * @param providerId
   * @param identity
   */
  private buildInteractionParts(providerId: string, identity: IIdentity) {
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
    idpIdentity: IIdentity,
    spId: string,
    spIdentity: IIdentity,
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

  /**
   * Store identity that will be retrieved by `oidc-provider`
   * and sent to the SP
   *
   * We need to replace IdP's sub, by our own sub
   *
   * @param interactionId
   * @param identity
   * @param sub
   */
  private async storeIdentityForServiceProvider(
    interactionId: string,
    identity: IIdentity,
    sub: string,
  ): Promise<void> {
    const identityForSp = { ...identity, sub };
    const meta = {};
    await this.identity.storeSpIdentity(interactionId, identityForSp, meta);
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
}
