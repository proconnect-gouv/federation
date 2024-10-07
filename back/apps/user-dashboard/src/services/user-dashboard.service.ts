import * as _ from 'lodash';
import { DateTime } from 'luxon';

import { Injectable } from '@nestjs/common';

import { validateDto } from '@fc/common';
import { ConfigService, validationOptions } from '@fc/config';
import {
  IdpConfigUpdateEmailParameters,
  MailerConfig,
  MailerNotificationConnectException,
  MailerService,
  MailFrom,
  MailTo,
  NoEmailException,
} from '@fc/mailer';
import { PivotIdentityDto } from '@fc/oidc';
import { FormattedIdpDto, FormattedIdpSettingDto } from '@fc/user-preferences';

import {
  AppConfig,
  FraudFormEmailParameters,
  FraudFormValuesDto,
  OtrsConfig,
} from '../dto';
import { EmailsTemplates } from '../enums';
import { FormatDate } from '../enums/format-date.enum';
import { IdpSettingsChangesInterface } from '../interfaces';

@Injectable()
export class UserDashboardService {
  constructor(
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
  ) {}

  async sendMail(userInfo, idpConfiguration): Promise<void> {
    const { from } = this.config.get<MailerConfig>('Mailer');
    let errors = await validateDto(from, MailFrom, validationOptions);
    if (errors.length > 0) {
      throw new NoEmailException();
    }

    const { email, givenName, familyName } = userInfo;

    const mailTo: MailTo = {
      email,
      name: `${givenName} ${familyName}`,
    };

    const to: MailTo[] = [mailTo];
    errors = await validateDto(mailTo, MailTo, validationOptions);
    if (errors.length > 0) {
      throw new NoEmailException();
    }

    // -- email bodyfamilyName
    const body = await this.getIdpConfigUpdateEmailBodyContent(
      userInfo,
      idpConfiguration,
    );

    await this.mailer.send({
      from,
      to,
      subject: `Modification de vos accès dans FranceConnect`,
      body,
    });
  }

  async sendFraudForm(
    identity: PivotIdentityDto,
    fraudFormValues: FraudFormValuesDto,
  ): Promise<void> {
    const userFullName = [identity.given_name, identity.family_name]
      .join(' ')
      .trim();

    const from: MailFrom = {
      email: fraudFormValues.contactEmail,
      name: userFullName,
    };

    let errors = await validateDto(from, MailFrom, validationOptions);
    if (errors.length > 0) {
      throw new NoEmailException();
    }

    const { otrsEmail, recipientName, fraudEmailSubject } =
      this.config.get<OtrsConfig>('Otrs');

    const mailTo: MailTo = {
      email: otrsEmail,
      name: recipientName,
    };

    const to: MailTo[] = [mailTo];

    errors = await validateDto(mailTo, MailTo, validationOptions);
    if (errors.length > 0) {
      throw new NoEmailException();
    }

    const body = await this.getFraudFormEmailBodyContent(
      identity,
      fraudFormValues,
    );

    await this.mailer.send({
      from,
      to,
      subject: fraudEmailSubject,
      body,
      replyTo: from,
    });
  }

  formatUserPreferenceChangeTrackLog(
    formattedIdpSetting: FormattedIdpSettingDto,
  ): IdpSettingsChangesInterface {
    const changeListToLog: IdpSettingsChangesInterface = { list: [] };

    if (formattedIdpSetting.hasAllowFutureIdpChanged) {
      changeListToLog.futureAllowedNewValue =
        formattedIdpSetting.allowFutureIdp;
    }

    changeListToLog.list = formattedIdpSetting.updatedIdpSettingsList.map(
      ({ uid, name, title, isChecked }: FormattedIdpDto) => {
        return {
          uid,
          name,
          title,
          allowed: isChecked,
        };
      },
    );

    return changeListToLog as IdpSettingsChangesInterface;
  }

  private formatDateForEmail(isoDate: string): string {
    const { timezone } = this.config.get<AppConfig>('App');

    return DateTime.fromISO(isoDate)
      .setZone(timezone)
      .setLocale('fr')
      .toFormat(FormatDate.LUXON_FORMAT_DATETIME_FULL_FR);
  }

  private async getIdpConfigUpdateEmailBodyContent(
    userInfo,
    idpConfiguration,
  ): Promise<string> {
    const { email } = userInfo;
    const {
      updatedIdpSettingsList,
      hasAllowFutureIdpChanged,
      allowFutureIdp,
      updatedAt,
    } = idpConfiguration;

    const formattedUpdateDate = this.formatDateForEmail(updatedAt);
    const idpConfigUpdateEmail = {
      email,
      updatedIdpSettingsList,
      allowFutureIdp,
      hasAllowFutureIdpChanged,
      formattedUpdateDate,
    };

    const dtoValidationErrors = await validateDto(
      idpConfigUpdateEmail,
      IdpConfigUpdateEmailParameters,
      validationOptions,
    );

    if (dtoValidationErrors.length > 0) {
      throw new MailerNotificationConnectException();
    }

    const fileName = EmailsTemplates.IDP_CONFIG_UPDATES_EMAIL;
    const htmlContent = this.mailer.mailToSend(fileName, idpConfigUpdateEmail);

    return htmlContent;
  }

  private async getFraudFormEmailBodyContent(
    identity: PivotIdentityDto,
    fraudFormValues: FraudFormValuesDto,
  ): Promise<string> {
    const formIdentity = _.omit(identity, ['gender']);
    const fraudFormEmailParameters = {
      ...formIdentity,
      ...fraudFormValues,
    };

    const dtoValidationErrors = await validateDto(
      fraudFormEmailParameters,
      FraudFormEmailParameters,
      validationOptions,
    );

    if (dtoValidationErrors.length > 0) {
      throw new MailerNotificationConnectException();
    }

    const fileName = EmailsTemplates.FRAUD_FORM_EMAIL;
    const htmlContent = this.mailer.mailToSend(
      fileName,
      fraudFormEmailParameters,
    );

    return htmlContent;
  }
}
