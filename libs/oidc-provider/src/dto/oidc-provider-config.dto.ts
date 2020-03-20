/* istanbul ignore file */

import {
  IsString,
  IsArray,
  IsObject,
  IsBoolean,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Routes {
  @IsString()
  readonly authorization: string;

  @IsString()
  readonly interaction: string;

  @IsString()
  readonly end_session: string;

  @IsString()
  readonly revocation: string;

  @IsString()
  readonly token: string;

  @IsString()
  readonly userinfo: string;
}

class Cookies {
  @IsArray()
  readonly keys: string[];
}

class FeatureSetting {
  @IsBoolean()
  readonly enabled: boolean;
}

class Features {
  @ValidateNested()
  @Type(() => FeatureSetting)
  readonly introspection: FeatureSetting;

  @ValidateNested()
  @Type(() => FeatureSetting)
  readonly revocation: FeatureSetting;

  @ValidateNested()
  @Type(() => FeatureSetting)
  readonly devInteractions: FeatureSetting;
}

class Configuration {
  @IsObject()
  @ValidateNested()
  @Type(() => Routes)
  readonly routes: Routes;

  @IsObject()
  @ValidateNested()
  @Type(() => Cookies)
  readonly cookies: Cookies;

  @IsArray()
  readonly grant_types_supported?: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => Features)
  readonly features: Features;

  /** @TODO fix authorized values */
  @IsArray()
  readonly acrValues: string[];

  @IsObject()
  readonly claims: any;

  /**
   * clients is not loaded from real configuration
   * but is loaded from database after configuration is initialized.
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#clients
   *
   * Thus we have to make it optional for the time being
   *
   * @TODO implement a sub DTO to validate clients content
   */
  @IsArray()
  @IsOptional()
  readonly clients?: any[];

  /**
   * `findAccount` is a function.
   * This is not something that should live in a DTO.
   * Although this is the way `oidc-provider` library offers
   * to implement our data resolver
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#findaccount
   *
   * This property is optional because it is injected by the module
   * rather than by real configuration.
   */
  @IsOptional()
  readonly findAccount?: any;

  /**
   * `renderError` is a function.
   * This is not something that should live in a DTO.
   * Although this is the way `oidc-provider` library offers
   * to implement our error renderer
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#rendererror
   *
   * This property is optional because it is injected by the module
   * rather than by real configuration.
   */
  @IsOptional()
  readonly renderError?: any;
}

export class OidcProviderConfig {
  @IsString()
  readonly issuer: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Configuration)
  readonly configuration: Configuration;

  @IsNumber()
  @IsOptional()
  readonly reloadConfigDelayInMs?: number;
}
