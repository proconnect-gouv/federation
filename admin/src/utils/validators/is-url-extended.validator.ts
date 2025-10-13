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
  constructor(@InjectConfig() private readonly config: ConfigService) {}
  validate(url: string): boolean {
    if (this.config.get('app').allowInsecureUrls) {
      return SIMPLE_URL_REGEX.test(url);
    }

    return isURL(url, {
      require_tld: true,
      protocols: ['https'],
      require_protocol: true,
    });
  }
  defaultMessage(): string {
    const invalidURL = 'URL is invalid';
    if (!this.config.get('app').allowInsecureUrls) {
      return `${invalidURL} (localhost is disabled by configuration)`;
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
