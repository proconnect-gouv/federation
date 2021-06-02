import {
  ValidatorOptions,
  isString,
  isObject,
  validateSync,
} from 'class-validator';
import * as deepFreeze from 'deep-freeze';
import { plainToClass } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { IConfigOptions } from './interfaces';

import { UnknownConfigurationNameError } from './errors';

export const validationOptions: ValidatorOptions = {
  skipMissingProperties: false,
  whitelist: true,
  forbidUnknownValues: true,
  forbidNonWhitelisted: true,
};

@Injectable()
export class ConfigService {
  private readonly configuration: any;

  constructor({ config, schema }: IConfigOptions) {
    ConfigService.validate(config, schema);

    // No one should be able to override configuration after startup
    this.configuration = deepFreeze(config);
  }

  private static validate(config, schema) {
    const object = plainToClass(schema, config);
    const errors = validateSync(object, validationOptions);

    if (errors.length > 0) {
      console.error('Invalid configuration Error');
      console.error(JSON.stringify(errors, null, 2));
      console.error('Exiting app');
      process.exit(1);
    }
  }

  /**
   * Public getter
   * Specify type in order to have static binding while using returned object
   * @param paths
   */
  get<T extends any>(paths): T {
    if (!isString(paths) || paths.length === 0) {
      throw new UnknownConfigurationNameError(
        `Asked unknown configuration: <${paths}>`,
      );
    }

    return paths.split('.').reduce((current, next) => {
      if (isObject(current) && next in current) {
        return current[next];
      }

      throw new UnknownConfigurationNameError(
        `Asked unknown configuration: <${next}>`,
      );
    }, this.configuration);
  }
}
