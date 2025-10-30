import {
  isURL,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { Injectable } from '@nestjs/common';

import { ConfigService, InjectConfig } from 'nestjs-config';

/**
 * This regex is dedicated to integration and local environment usage.
 * It is shared with other applications, including espace-partenaires & admin.
 */
const SIMPLE_URL_REGEX = /^https?:\/\/[^/].+$/;

@ValidatorConstraint({ name: 'IsUrlExtended' })
@Injectable()
export class IsUrlExtendedConstraint implements ValidatorConstraintInterface {
  constructor(@InjectConfig() public readonly config: ConfigService) {}
  validate(url: string): boolean {
    const { allowInsecureUrls } = this.config.get('app');

    if (allowInsecureUrls) {
      return SIMPLE_URL_REGEX.test(url);
    }

    return isURL(url, {
      require_tld: true,
      protocols: ['https'],
      require_protocol: true,
    });
  }
  defaultMessage(): string {
    const { allowInsecureUrls } = this.config.get('app');
    const invalidURL = 'URL is invalid';
    if (!allowInsecureUrls) {
      return `${invalidURL} (https is mandatory, a valid tld is mandatory (eg. no localhost))`;
    }
    return `${invalidURL}`;
  }
}

export function IsUrlExtended(validationOptions?: ValidationOptions) {
  return function (object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUrlExtendedConstraint,
    });
  };
}
