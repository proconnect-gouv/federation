import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CoreService } from '@fc/core';
import { IFeatureHandler, FeatureHandler } from '@fc/feature-handler';
import { ServiceProviderService } from '@fc/service-provider';
import { CryptographyFcaService } from '@fc/cryptography-fca';

@Injectable()
@FeatureHandler('core-fca-default-verify')
export class CoreFcaDefaultVerifyHandler implements IFeatureHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly core: CoreService,
    private readonly serviceProvider: ServiceProviderService,
    private readonly cryptographyFca: CryptographyFcaService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Main business manipulations occurs in this method
   *
   * 1. Get infos on current interaction and identity fetched from IdP
   * 2. Store interaction with account service (long term storage)
   * 3. Store identity with session service (short term storage)
   * 4. Display consent page
   *
   * @param req
   */
  async handle(req: any): Promise<void> {
    this.logger.debug('getConsent service: ##### core-fca-default-verify');

    const { interactionId } = req.fc;

    // Grab informations on interaction and identity
    const session = await this.session.get(interactionId);
    const { idpId, idpIdentity, idpAcr, spId, spAcr } = session;

    // Acr check
    this.core.checkIfAcrIsValid(idpAcr, spAcr);

    /**
     * @todo - what is the algorithm of the identity hash for fca ?
     *
     */
    const hashSp = this.cryptographyFca.computeIdentityHash(idpIdentity);
    await this.core.checkIfAccountIsBlocked(hashSp);

    const { entityId } = await this.serviceProvider.getById(spId);

    const subSp = this.cryptographyFca.computeSubV1(entityId, hashSp);

    const hashIdp = this.cryptographyFca.computeIdentityHash(idpIdentity);
    const subIdp = this.cryptographyFca.computeSubV1(spId, hashIdp);

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
     * @TODO #305 generate unique sub ?
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/305
     */
    const spIdentityCleaned = { ...idpIdentity, sub: subSp };

    // Delete idp identity from volatile memory but keep the sub for the business logs.
    const idpIdentityCleaned = { sub: subIdp };

    await this.session.patch(interactionId, {
      idpIdentity: idpIdentityCleaned,
      spIdentity: spIdentityCleaned,
    });
  }
}
