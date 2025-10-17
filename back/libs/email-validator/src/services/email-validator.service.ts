import {
  singleValidationFactory,
  type SingleValidationHandler,
} from '@gouvfr-lasuite/proconnect.debounce/api';

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
      const { debounceApiKey } =
        this.config.get<EmailValidatorConfig>('EmailValidator');
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

      const { send_transactional } =
        await this.getSingleValidationMethod(debounceApiKey)(email);

      this.logger.info(
        `Email address "${email}" is ${send_transactional === '1' ? '' : 'not '}safe to send.`,
      );

      return send_transactional === '1';
    } catch (error) {
      this.logger.err(error);
      // NOTE(douglasduteil): Non-blocking validation
      // We don't want to block the user if an error occurs on the http level
      return true;
    }
  }

  private getSingleValidationMethod(
    debounceApiKey: string,
  ): SingleValidationHandler | (() => Promise<{ send_transactional: string }>) {
    return debounceApiKey
      ? singleValidationFactory(debounceApiKey)
      : () =>
          Promise.resolve({
            send_transactional: '1',
          });
  }
}
