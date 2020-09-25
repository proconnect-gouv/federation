import {
  ValidationOptions,
  ValidateBy,
  ValidatorConstraint,
  ValidationArguments
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { ArrayAtLeastOneConstraint } from '@fc/common';
import { ConfigService } from '@fc/config';
import { OidcProviderConfig } from '../dto';
import { OidcProviderPrompt } from '../enums';


@ValidatorConstraint()
@Injectable()
export class IsValidPromptConstraint extends ArrayAtLeastOneConstraint {

  configValues: OidcProviderPrompt[];
  constructor(@Inject('ConfigService') public readonly config: ConfigService) {
    super();
    const { forcedPrompt } = this.config.get<OidcProviderConfig>('OidcProvider');
    this.configValues = forcedPrompt;
  }

  getAllowedList(_args: ValidationArguments): string[] {
    return this.configValues;
  }
}

// declarative code
/* istanbul ignore next */
export function IsValidPrompt(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'IsValidPrompt',
      constraints: [],
      validator: IsValidPromptConstraint,
    },
    validationOptions,
  );
}
