import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CoreService } from '@fc/core';
import { IFeatureHandler, FeatureHandler } from '@fc/feature-handler';
import { ServiceProviderService } from '@fc/service-provider';
@Injectable()
@FeatureHandler('core-fcp-eidas-verify')
export class CoreFcpEidasVerifyHandler implements IFeatureHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly core: CoreService,
    private readonly serviceProvider: ServiceProviderService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async handle(req: any): Promise<void> {
    this.logger.debug('getConsent service: ##### core-fcp-eidas-verify ');

    const { interactionId } = req.fc;

    // Grab informations on interaction and identity
    const session = await this.session.get(interactionId);
    const { idpId, idpIdentity, idpAcr, spId, spAcr } = session;
    const { entityId } = await this.serviceProvider.getById(spId);

    // Acr check
    this.core.checkIfAcrIsValid(idpAcr, spAcr);

    // Save interaction to database & get sp's sub to avoid double computation
    const { spInteraction } = await this.core.computeInteraction(
      {
        idpId,
        idpIdentity, // use identity from IdP for IdP
      },
      {
        spId,
        spIdentity: idpIdentity,
        spRef: entityId,
      },
    );

    /**
     * Prepare identity that will be retrieved by `oidc-provider`
     * and sent to the SP
     *
     * We need to replace IdP's sub, by our own sub
     */
    const spIdentityCleaned = { ...idpIdentity, sub: spInteraction.sub };

    // Delete idp identity from volatile memory but keep the sub for the business logs.
    const idpIdentityCleaned = { sub: idpIdentity.sub };

    await this.session.patch(interactionId, {
      amr: ['eidas'],
      idpIdentity: idpIdentityCleaned,
      spIdentity: spIdentityCleaned,
    });
  }
}
