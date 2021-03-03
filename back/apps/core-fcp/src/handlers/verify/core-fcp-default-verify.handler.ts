import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';
import {
  RnippService,
  RnippRequestedEvent,
  RnippReceivedValidEvent,
} from '@fc/rnipp';
import { CoreService } from '@fc/core';
import { ServiceProviderService } from '@fc/service-provider';
import { RnippPivotIdentity } from '@fc/rnipp';
import { IOidcIdentity } from '@fc/oidc';
import { IFeatureHandler, FeatureHandler } from '@fc/feature-handler';
import { CryptographyFcpService } from '@fc/cryptography-fcp';

@Injectable()
@FeatureHandler('core-fcp-default-verify')
export class CoreFcpDefaultVerifyHandler implements IFeatureHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly core: CoreService,
    private readonly tracking: TrackingService,
    private readonly rnipp: RnippService,
    private readonly serviceProvider: ServiceProviderService,
    private readonly cryptographyFcp: CryptographyFcpService,
  ) {
    this.logger.setContext(this.constructor.name);
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
   */
  async handle(req: any): Promise<void> {
    this.logger.debug('getConsent service: ##### core-fcp-default-verify');

    const { interactionId } = req.fc;

    // Grab informations on interaction and identity
    const session = await this.session.get(interactionId);
    const { idpId, idpIdentity, idpAcr, spId, spAcr } = session;

    /**
    * @todo - le DTO est permissif et devrait forcer les données
      if (!idpId || !idpIdentity) {
        throw new CoreMissingInteraction('identity provider');
      }
      if (!spIdentity || !spId) {
        throw new CoreMissingInteraction('service provider');
      }
    */

    // Acr check
    this.core.checkIfAcrIsValid(idpAcr, spAcr);

    // Identity check and normalization
    const rnippIdentity = await this.rnippCheck(idpIdentity, req);

    const { entityId } = await this.serviceProvider.getById(spId);

    const hashSp = this.cryptographyFcp.computeIdentityHash(rnippIdentity);

    await this.core.checkIfAccountIsBlocked(hashSp);

    const subSp = this.cryptographyFcp.computeSubV1(entityId, hashSp);
    const idpIdentityHash = this.cryptographyFcp.computeIdentityHash(
      idpIdentity,
    );
    const subIdp = this.cryptographyFcp.computeSubV1(spId, idpIdentityHash);

    // Save interaction to database & get sp's sub to avoid double computation
    await this.core.computeInteraction(
      {
        spId,
        entityId,
        subSp,
        hashSp,
      },
      {
        idpId,
        subIdp,
      },
    );

    /**
     * Prepare identity that will be retrieved by `oidc-provider`
     * and sent to the SP
     *
     * We need to replace IdP's sub, by our own sub
     */
    const spIdentity = { ...idpIdentity, sub: subSp };

    // Delete idp identity from volatile memory but keep the sub for the business logs.
    const idpIdentityCleaned = { sub: subIdp };

    await this.session.patch(interactionId, {
      amr: ['fc'],
      idpIdentity: idpIdentityCleaned,
      spIdentity,
    });
  }

  /**
   *
   * @param idpIdentity
   * @param req
   */
  private async rnippCheck(
    idpIdentity: IOidcIdentity,
    req: any,
  ): Promise<RnippPivotIdentity> {
    this.tracking.track(RnippRequestedEvent, req);
    const rnippIdentity = await this.rnipp.check(idpIdentity);
    this.tracking.track(RnippReceivedValidEvent, req);

    return rnippIdentity;
  }
}
