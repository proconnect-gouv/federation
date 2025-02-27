import type { SingleValidationHandler } from '@gouvfr-lasuite/proconnect.debounce/api';

import { Inject, Injectable } from '@nestjs/common';

import { LoggerService } from '@fc/logger';

import { SINGLE_VALIDATION_TOKEN } from '../tokens';

@Injectable()
export class EmailValidatorService {
  constructor(
    private readonly logger: LoggerService,
    @Inject(SINGLE_VALIDATION_TOKEN)
    private readonly singleValidation: SingleValidationHandler,
  ) {}

  async validate(email: string) {
    if (!email.startsWith('debounce+')) {
      return true;
    }
    try {
      const emailWithoutPrefix = email.replace('debounce+', '');
      const { send_transactional } =
        await this.singleValidation(emailWithoutPrefix);
      this.logger.info(
        `Email address "${emailWithoutPrefix}" is ${send_transactional === '1' ? '' : 'not '}safe to send.`,
      );
      return send_transactional === '1';
    } catch (error) {
      this.logger.err(error);
      // NOTE(douglasduteil): Non-blocking validation
      // We don't want to block the user if an email occurs on the http level
      return true;
    }
  }
}
