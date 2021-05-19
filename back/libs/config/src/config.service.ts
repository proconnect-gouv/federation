import {
  ValidatorOptions,
  isString,
  isObject,
  validateSync,
} from 'class-validator';
import * as deepFreeze from 'deep-freeze';
import { plainToClass } from 'class-transformer';
import { Inject, Injectable } from '@nestjs/common';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { HttpsOptionDto } from '@fc/common';
import { CONFIG_OPTIONS } from './tokens';
import { IConfigOptions } from './interfaces';
import { UnknownConfigurationNameError } from './errors';
import { readFileSync } from 'fs';

export const validationOptions: ValidatorOptions = {
  skipMissingProperties: false,
  whitelist: true,
  forbidUnknownValues: true,
  forbidNonWhitelisted: true,
};

@Injectable()
export class ConfigService {
  private readonly configuration: any;

  constructor(@Inject(CONFIG_OPTIONS) configOptions: IConfigOptions) {
    const { config, schema } = configOptions;

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

  /**
   * @todo #534 ETQ Dev, je veux que la configuration soit initialisé avant l'application Server
   * cette fonction disparaitra et les options seront intégrés au config standard
   */
  /**
   * Grab the https options from environment variables
   * @returns {HttpsOptions} the HTTPS definition for NestJS
   */
  static getHttpsOptions(): HttpsOptions | null {
    const {
      App_HTTPS_SERVER_KEY: keyPath,
      App_HTTPS_SERVER_CERT: certPath,
    } = process.env;

    const hasHttpsOptions = keyPath && certPath;

    if (!hasHttpsOptions) {
      return null;
    }

    const key = ConfigService.getHttpsCert(keyPath);
    const cert = ConfigService.getHttpsCert(certPath);

    const data = {
      key,
      cert,
    };

    ConfigService.validate(data, HttpsOptionDto);

    return data;
  }

  private static getHttpsCert(path: string): string {
    try {
      return readFileSync(path, 'utf-8');
    } catch (e) {
      throw new Error(`No HTTPS Certificate found at path : ${path}`);
    }
  }
}
