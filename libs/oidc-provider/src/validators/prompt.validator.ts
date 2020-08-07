import {
  ValidatorConstraint,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { Injectable, Inject } from '@nestjs/common';
import { arrayInclude } from '@fc/common';
import { ConfigService } from '@fc/config';
import { OidcProviderConfig } from '../dto';

@ValidatorConstraint()
@Injectable()
export class IsValidPromptConstraint implements ValidatorConstraintInterface {
  private readonly allowed: string[];

  constructor(@Inject('ConfigService') private readonly config: ConfigService) {
    const { forcedPrompt } = this.config.get<OidcProviderConfig>(
      'OidcProvider',
    );
    this.allowed = forcedPrompt;
  }

  validate(value: unknown) {
    return value instanceof Array && arrayInclude(value, this.allowed);
  }

  defaultMessage(args: ValidationArguments) {
    return `prompt allows only theses values: "${this.allowed.join(
      ', ',
    )}", got: "${args.value.join(', ')}"`;
  }
}

// declarative code
/* istanbul ignore next */
export function IsValidPrompt(validationOptions?: ValidationOptions) {
  // declarative code
  /* istanbul ignore next */
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPromptConstraint,
    });
  };
}
