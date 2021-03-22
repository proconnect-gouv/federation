import * as ejs from 'ejs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { ConfigService, validationOptions } from '@fc/config';
import {
  MailerConfig,
  MailerService,
  MailTo,
  MailFrom,
  NoEmailException,
  MailerNotificationConnectException,
  ConnectNotificationEmailParameters,
} from '@fc/mailer';
import { IFeatureHandler, FeatureHandler } from '@fc/feature-handler';
import { validateDto } from '@fc/common';
import { OidcSession } from '@fc/oidc';

@Injectable()
@FeatureHandler('core-fcp-send-email')
export class CoreFcpSendEmailHandler implements IFeatureHandler {
  private configMailer;

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
  ) {
    this.logger.setContext(this.constructor.name);
    this.configMailer = this.config.get<MailerConfig>('Mailer');
  }

  getTodayFormattedDate(datejs: Date): string {
    const timeZone = 'Europe/Paris';
    // use `[]` instead of `fr-FR` to use the default local
    const locateDate = datejs.toLocaleString([], { timeZone });
    const date = new Date(locateDate);

    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    const formattedDate = `Le ${day}/${month}/${year} à ${hours}:${minutes}`;
    return formattedDate;
  }

  hydrateConnectNotificationEmailTemplate(
    connectNotificationEmailParameters: ConnectNotificationEmailParameters,
  ): string {
    const { template } = this.configMailer;
    const htmlContent = ejs.render(template, {
      locals: connectNotificationEmailParameters,
    });
    return htmlContent;
  }

  async getConnectNotificationEmailBodyContent(
    session: OidcSession,
  ): Promise<string> {
    const { idpName, spIdentity, spName } = session;
    const today = this.getTodayFormattedDate(new Date());
    const connectNotificationEmailParameters = {
      familyName: spIdentity.family_name,
      givenName: spIdentity.given_name,
      idpName,
      spName,
      today,
    };

    const dtoValidationErrors = await validateDto(
      connectNotificationEmailParameters,
      ConnectNotificationEmailParameters,
      validationOptions,
    );
    if (dtoValidationErrors.length > 0) {
      throw new MailerNotificationConnectException();
    }

    const htmlContent = this.hydrateConnectNotificationEmailTemplate(
      connectNotificationEmailParameters,
    );
    return htmlContent;
  }

  /**
   * The arguments sent to all FeatureHandler's handle() methods must be
   * typed by a interface exteded from `IFeatureHandler`
   * @see IVerifyFeatureHandlerHandleArgument as an exemple.
   * @todo #FC-487
   * @author Hugues
   * @date 2021-16-04
   */
  /**
   * Send an email to the authenticated end-user after consent.
   * If a user haven't provided a valid email, an error is thrown.
   * This validation is done here because only FCP is concerned by the validation.
   *
   * @param {OidcSession} session session content.
   * @returns {Promise<void>}
   */
  async handle(session: OidcSession): Promise<void> {
    // -- email from
    const { from } = this.configMailer;
    let errors = await validateDto(from, MailFrom, validationOptions);
    if (errors.length > 0) {
      throw new NoEmailException();
    }

    // -- email to
    const { spName, spIdentity } = session;
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
    errors = await validateDto(mailTo, MailTo, validationOptions);
    if (errors.length > 0) {
      throw new NoEmailException();
    }

    // -- email body
    const body = await this.getConnectNotificationEmailBodyContent(session);

    this.logger.trace({ from, to });

    // -- send
    this.mailer.send({
      from,
      to,
      subject: `Connexion depuis FranceConnect sur ${spName}`,
      body,
    });
  }
}
