/* istanbul ignore file */

import {
  IsString,
  IsArray,
  IsObject,
  IsBoolean,
  ValidateNested,
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
}

export class OidcProviderConfig {
  @IsString()
  readonly issuer: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Configuration)
  readonly configuration: Configuration;
}
