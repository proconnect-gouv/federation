import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CoreService } from '@fc/core';
import { ServiceProviderService } from '@fc/service-provider';

@Injectable()
export class CoreFcaService {
  constructor(
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly core: CoreService,
    private readonly serviceProvider: ServiceProviderService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Main business manipulations occurs in this method
   *
   * 1. Get infos on current interaction and identity fetched from IdP
   * 2. Store interaction with account service (long term storage)
   * 3. Store identity with session service (short term storage)
   * 4. Redirects to login
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
    const { interactionId } = req.fc;

    // Grab informations on interaction and identity
    const session = await this.session.get(interactionId);
    const { idpId, idpIdentity, idpAcr, spId, spAcr } = session;

    // Acr check
    this.core.checkIfAcrIsValid(idpAcr, spAcr);

    await this.core.checkIfAccountIsBlocked(idpIdentity);

    /**
     * @todo - what is the algorithm of the sub for fca ?
     *
     */
    const { entityId } = await this.serviceProvider.getById(spId);

    // Save interaction to database & get sp's sub to avoid double computation
    const { spInteraction } = await this.core.computeInteraction(
      {
        idpId,
        idpIdentity, // use identity from IdP for IdP
      },
      {
        spId,
        spRef: entityId,
        spIdentity: idpIdentity, // use identity from RNIPP for SP
      },
    );

    /**
     * @TODO #305 generate unique sub ?
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/305
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
}
