import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { ConfigService, validationOptions } from '@fc/config';
import { MailerConfig, MailerService, MailTo } from '@fc/mailer';
import { IFeatureHandler, FeatureHandler } from '@fc/feature-handler';
import { validateDto } from '@fc/common';
import { CoreFcpNoEmailException } from '../../exceptions';

@Injectable()
@FeatureHandler('core-fcp-send-email')
export class CoreFcpSendEmailHandler implements IFeatureHandler {
  private configMailer;

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly session: SessionService,
    private readonly mailer: MailerService,
  ) {
    this.logger.setContext(this.constructor.name);
    this.configMailer = this.config.get<MailerConfig>('Mailer');
  }

  /**
   * Send an email to the authenticated end-user after consent.
   * If a user haven't provided a valid email, an error is thrown.
   * This validation is done here because only FCP is concerned by the validation.
   *
   * @param {object} req Express req object
   * @returns {Promise<void>}
   */
  async handle(req: any): Promise<void> {
    this.logger.debug(
      'CoreFcpSendEmailHandler.handle(): ##### core-fcp-send-email',
    );

    const { from } = this.configMailer;
    const { interactionId } = req.fc;
    const { spName, idpName, spIdentity } = await this.session.get(
      interactionId,
    );
    const {
      email,
      given_name: givenName,
      family_name: familyName,
    } = spIdentity;

    const mailTo: MailTo = {
      email,
      name: `${givenName} ${familyName}`,
    };
    const to: MailTo[] = [mailTo];

    const errors = await validateDto(mailTo, MailTo, validationOptions);

    if (errors.length > 0) {
      throw new CoreFcpNoEmailException('No email defined');
    }

    this.mailer.send({
      from,
      to,
      subject: `Connexion depuis FranceConnect sur ${spName}`,
      body: `Connexion établie via ${idpName} !`,
    });
  }
}
