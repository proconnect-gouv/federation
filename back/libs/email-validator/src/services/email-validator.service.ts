import {
  singleValidationFactory,
  type SingleValidationHandler,
} from '@gouvfr-lasuite/proconnect.debounce/api';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { FqdnToIdpAdapterMongoService } from '@fc/fqdn-to-idp-adapter-mongo';
import { LoggerService } from '@fc/logger';

import { EmailValidatorConfig } from '../dto';

@Injectable()
export class EmailValidatorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly fqdnToIdpAdapterMongo: FqdnToIdpAdapterMongoService,
    private readonly config: ConfigService,
  ) {}

  async validate(email: string) {
    try {
      const { debounceApiKey } =
        this.config.get<EmailValidatorConfig>('EmailValidator');
      const fqdnToIdp =
        await this.fqdnToIdpAdapterMongo.fetchFqdnToIdpByEmail(email);

      if (fqdnToIdp.length > 0) {
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
