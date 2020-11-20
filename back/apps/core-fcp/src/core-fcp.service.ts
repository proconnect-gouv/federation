import { Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { MailerConfig, MailerService } from '@fc/mailer';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';
import {
  RnippService,
  RnippRequestedEvent,
  RnippReceivedValidEvent,
} from '@fc/rnipp';
import { CoreService } from '@fc/core';

@Injectable()
export class CoreFcpService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly session: SessionService,
    private readonly core: CoreService,
    private readonly tracking: TrackingService,
    private readonly rnipp: RnippService,
    private readonly mailer: MailerService,
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
   * @param res
   */
  async verify(req) {
    this.logger.debug('getConsent service');

    const { interactionId } = req.fc;

    // Grab informations on interaction and identity
    const session = await this.session.get(interactionId);
    const { idpId, idpIdentity, idpAcr, spId, spAcr } = session;

    // Acr check
    this.core.checkIfAcrIsValid(idpAcr, spAcr);

    // Identity check and normalization
    const rnippIdentity = await this.rnippCheck(idpIdentity, req);

    await this.core.checkIfAccountIsBlocked(rnippIdentity);

    // Save interaction to database & get sp's sub to avoid double computation
    const { spInteraction } = await this.core.storeInteraction(
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
