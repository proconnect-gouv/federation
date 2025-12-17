import {
  gouvfrDomains,
  mostUsedFreeEmailDomains,
  otherGouvDomains,
} from '@proconnect-gouv/proconnect.core/data';
import { run as spellCheckEmail } from '@zootools/email-spell-checker';
import { chain, uniq } from 'lodash';
import { resolveMx } from 'node:dns/promises';

import { Injectable } from '@nestjs/common';

import { AccountFcaService } from '@fc/account-fca';
import { ConfigService } from '@fc/config';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';

import { EmailValidatorConfig } from '../dto';

@Injectable()
export class EmailValidatorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly identityProviderAdapterMongoService: IdentityProviderAdapterMongoService,
    private readonly config: ConfigService,
    private readonly accountFcaService: AccountFcaService,
  ) {}

  async validate(email: string) {
    try {
      const idps =
        await this.identityProviderAdapterMongoService.getIdpsByEmail(email);
      if (idps.length > 0) {
        return { isEmailValid: true };
      }

      const accountFcaExists =
        await this.accountFcaService.checkEmailExists(email);
      if (accountFcaExists) {
        return { isEmailValid: true };
      }

      const isEmailValid = await this.isEmailDomainValid(email);
      if (isEmailValid) {
        return { isEmailValid: true };
      }

      const idpDomains = await this.getIdpDomains();

      const suggestion = this.getEmailSuggestion(email, idpDomains);
      return { isEmailValid: false, suggestion };
    } catch (error) {
      this.logger.error(error);
      return { isEmailValid: true };
    }
  }

  private getEmailSuggestion(email: string, idpDomains: string[]): string {
    const { domainWhitelist } =
      this.config.get<EmailValidatorConfig>('EmailValidator');

    const domains = uniq([
      ...gouvfrDomains,
      ...otherGouvDomains,
      ...mostUsedFreeEmailDomains,
      ...idpDomains,
      ...domainWhitelist,
    ]);

    const suggestedEmail = spellCheckEmail({
      domains,
      domainThreshold: 3,
      topLevelDomains: ['fr', 'com', 'net'],
      secondLevelDomains: ['gouv'],
      email,
    });
    return suggestedEmail ? suggestedEmail.full : '';
  }

  private async getIdpDomains() {
    const idps = await this.identityProviderAdapterMongoService.getList();
    const domains = chain(idps)
      .map((idp) => idp.fqdns)
      .flatten()
      .filter(Boolean)
      .uniq()
      .value();

    return domains;
  }

  private async isEmailDomainValid(email: string) {
    const { domainWhitelist } =
      this.config.get<EmailValidatorConfig>('EmailValidator');
    const emailDomain =
      this.identityProviderAdapterMongoService.getFqdnFromEmail(email);

    if (domainWhitelist.includes(emailDomain)) {
      return true;
    }

    try {
      await resolveMx(emailDomain);

      return true;
    } catch (error) {
      return false;
    }
  }
}
