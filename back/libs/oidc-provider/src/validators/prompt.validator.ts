import { ValidationArguments, ValidatorConstraint } from 'class-validator';

import { Injectable } from '@nestjs/common';

import { ArrayAtLeastOneConstraint } from '@fc/common';
import { ConfigService } from '@fc/config';

import { OidcProviderConfig } from '../dto';
import { OidcProviderPrompt } from '../enums';

@ValidatorConstraint()
@Injectable()
export class IsValidPromptConstraint extends ArrayAtLeastOneConstraint {
  configValues: OidcProviderPrompt[];
  constructor(public readonly config: ConfigService) {
    super();
    const { allowedPrompt } =
      this.config.get<OidcProviderConfig>('OidcProvider');
    this.configValues = allowedPrompt;
  }

  getAllowedList(_args: ValidationArguments): string[] {
    return this.configValues;
  }
}
