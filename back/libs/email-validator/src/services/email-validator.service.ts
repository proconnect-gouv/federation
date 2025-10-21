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

  // eslint-disable-next-line complexity
  async validate(email: string) {
    try {
      const idps =
        await this.identityProviderAdapterMongoService.getIdpsByEmail(email);
      if (idps.length > 0) {
        return true;
      }

      const accountFcaExists =
        await this.accountFcaService.checkEmailExists(email);
      if (accountFcaExists) {
        return true;
      }

      const isEmailValid = await this.isEmailDomainValid(email);
      if (!isEmailValid) {
        this.logger.error({ code: 'email_not_safe_to_send' });
      }

      return isEmailValid;
    } catch (error) {
      this.logger.error(error);
      // NOTE(douglasduteil): Non-blocking validation
      // We don't want to block the user if an error occurs on the http level
      return true;
    }
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
