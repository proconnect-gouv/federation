import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { MailerConfig, MailerService } from '@fc/mailer';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { FeatureHandler } from '@fc/feature-handler';
import { IdentityProviderService } from '@fc/identity-provider';

@Injectable()
export class CoreFcpService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly session: SessionService,
    private readonly mailer: MailerService,
    private readonly identityProvider: IdentityProviderService,
    public moduleRef: ModuleRef,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Main business manipulations occurs in this method
   *
   * @param req
   */
  async verify(req: any): Promise<void> {
    this.logger.debug('getConsent service');

    const { interactionId } = req.fc;

    const { idpId } = await this.session.get(interactionId);
    const idp = await this.identityProvider.getById(idpId);
    const { coreVerify } = idp.featureHandlers;

    const handler = await FeatureHandler.get(coreVerify, this);
    return await handler.handle(req);
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
