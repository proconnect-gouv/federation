import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';

const phoneRegex = /^\+?(?:[0-9][ -]?){6,14}[0-9]$/;

// We implemented a simple validator for phone number.
// It is not a full-fledged validator, but it is enough for our use case.
// We could use the IsPhoneNumberValidator from class-validator, but we need to
// cover multiple regions and the validator is not very flexible.
@ValidatorConstraint({ name: 'IsPhoneNumberSimpleValidator' })
@Injectable()
export class IsPhoneNumberSimpleValidatorConstraint implements ValidatorConstraintInterface {
  constructor(public readonly config: ConfigService) {}
  validate(value: string): boolean {
    return typeof value === 'string' && phoneRegex.test(value);
  }

  defaultMessage(): string {
    return `Le numéro de téléphone est invalide.`;
  }
}

export function IsPhoneNumberSimpleValidator(
  validationOptions?: ValidationOptions,
) {
  return function (object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneNumberSimpleValidatorConstraint,
    });
  };
}
