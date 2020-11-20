import { Injectable } from '@nestjs/common';
import { OidcProviderService } from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CryptographyService } from '@fc/cryptography';
import { AccountService } from '@fc/account';
import { ConfigService } from '@fc/config';
import { MailerService } from '@fc/mailer';
import { TrackingService } from '@fc/tracking';
import {
  RnippService,
  RnippRequestedEvent,
  RnippReceivedValidEvent,
} from '@fc/rnipp';
import { CoreService } from '@fc/core';

@Injectable()
export class CoreFcpService extends CoreService {
  constructor(
    logger: LoggerService,
    config: ConfigService,
    oidcProvider: OidcProviderService,
    session: SessionService,
    cryptography: CryptographyService,
    account: AccountService,
    mailer: MailerService,
    private readonly tracking: TrackingService,
    private readonly rnipp: RnippService,
  ) {
    super(logger, config, oidcProvider, session, cryptography, account, mailer);
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
}
