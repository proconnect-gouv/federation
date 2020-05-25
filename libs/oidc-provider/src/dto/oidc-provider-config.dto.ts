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
import { JWKECKey, JWKRSAKey } from 'jose';
import {
  AdapterConstructor,
  EncryptionEncValues,
  EncryptionAlgValues,
  ResponseType,
  AsymmetricSigningAlgorithm,
  ClientAuthMethod,
} from 'oidc-provider';

export class Routes {
  @IsString()
  readonly authorization: string;

  @IsString()
  readonly end_session: string;

  @IsString()
  readonly token: string;

  @IsString()
  readonly userinfo: string;

  @IsString()
  readonly revocation: string;

  @IsString()
  readonly jwks: string;
}

type SameSite = 'strict' | 'lax' | 'none';

class CookiesOptions {
  @IsNumber()
  maxAge: number;

  @IsString()
  sameSite: SameSite;

  @IsBoolean()
  signed: boolean;
}

class Cookies {
  @IsArray()
  @IsString({ each: true })
  readonly keys: string[];

  @ValidateNested()
  @Type(() => CookiesOptions)
  readonly long: CookiesOptions;

  @ValidateNested()
  @Type(() => CookiesOptions)
  readonly short: CookiesOptions;
}

class FeatureSetting {
  @IsBoolean()
  readonly enabled: boolean;
}

class Features {
  @ValidateNested()
  @Type(() => FeatureSetting)
  readonly revocation: FeatureSetting;

  @ValidateNested()
  @Type(() => FeatureSetting)
  readonly devInteractions: FeatureSetting;

  @ValidateNested()
  @Type(() => FeatureSetting)
  readonly encryption: FeatureSetting;

  @ValidateNested()
  @Type(() => FeatureSetting)
  readonly backchannelLogout: FeatureSetting;

  @ValidateNested()
  @Type(() => FeatureSetting)
  readonly jwtUserinfo: FeatureSetting;
}

class Ttl {
  @IsNumber()
  readonly AccessToken: number;

  @IsNumber()
  readonly AuthorizationCode: number;

  @IsNumber()
  readonly IdToken: number;
}

/** Non exhaustive
 * @see https://tools.ietf.org/html/rfc6749#page-73
 * @see https://oauth.net/2/grant-types/
 */
type GrantType =
  | 'authorization_code'
  | 'refresh_token'
  | 'device_code'
  | 'client_credentials'
  | 'password';

/**
 * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#pkce
 * @see https://github.com/panva/node-oidc-provider/blob/950c21d909b84c9de915ed30cff4d6f1f7cc95f7/types/index.d.ts#L72
 */
type ApplicationType = 'web' | 'native';

class ClientDefaults {
  @IsArray()
  @IsString({ each: true })
  grant_types: GrantType[];

  @IsString()
  id_token_signed_response_alg: AsymmetricSigningAlgorithm;

  @IsArray()
  @IsString({ each: true })
  response_types: ResponseType[];

  @IsString()
  application_type: ApplicationType;

  @IsString()
  token_endpoint_auth_method: ClientAuthMethod;
}

class WhitelistedJWA {
  @IsArray()
  @IsString({ each: true })
  authorizationEncryptionAlgValues: EncryptionAlgValues[];

  @IsArray()
  @IsString({ each: true })
  authorizationEncryptionEncValues: EncryptionEncValues[];

  @IsArray()
  @IsString({ each: true })
  authorizationSigningAlgValues: AsymmetricSigningAlgorithm[];

  @IsArray()
  @IsString({ each: true })
  dPoPSigningAlgValues: AsymmetricSigningAlgorithm[];

  @IsArray()
  @IsString({ each: true })
  idTokenEncryptionAlgValues: EncryptionAlgValues[];

  @IsArray()
  @IsString({ each: true })
  idTokenEncryptionEncValues: EncryptionEncValues[];

  @IsArray()
  @IsString({ each: true })
  idTokenSigningAlgValues: AsymmetricSigningAlgorithm[];

  @IsArray()
  @IsString({ each: true })
  introspectionEncryptionAlgValues: EncryptionAlgValues[];

  @IsArray()
  @IsString({ each: true })
  introspectionEncryptionEncValues: EncryptionEncValues[];

  @IsArray()
  @IsString({ each: true })
  introspectionEndpointAuthSigningAlgValues: AsymmetricSigningAlgorithm[];

  @IsArray()
  @IsString({ each: true })
  introspectionSigningAlgValues: AsymmetricSigningAlgorithm[];

  @IsArray()
  @IsString({ each: true })
  requestObjectEncryptionAlgValues: EncryptionAlgValues[];

  @IsArray()
  @IsString({ each: true })
  requestObjectEncryptionEncValues: EncryptionEncValues[];

  @IsArray()
  @IsString({ each: true })
  requestObjectSigningAlgValues: AsymmetricSigningAlgorithm[];

  @IsArray()
  @IsString({ each: true })
  revocationEndpointAuthSigningAlgValues: AsymmetricSigningAlgorithm[];

  @IsArray()
  @IsString({ each: true })
  tokenEndpointAuthSigningAlgValues: AsymmetricSigningAlgorithm[];

  @IsArray()
  @IsString({ each: true })
  userinfoEncryptionAlgValues: EncryptionAlgValues[];

  @IsArray()
  @IsString({ each: true })
  userinfoEncryptionEncValues: EncryptionEncValues[];

  @IsArray()
  @IsString({ each: true })
  userinfoSigningAlgValues: AsymmetricSigningAlgorithm[];
}

class Jwks {
  @IsArray()
  /** @TODO properly validate keys */
  readonly keys: Array<JWKECKey | JWKRSAKey>;
}

class Configuration {
  @IsObject()
  @IsOptional()
  readonly adapter?: AdapterConstructor;

  @IsObject()
  @ValidateNested()
  @Type(() => Routes)
  readonly routes: Routes;

  @IsObject()
  @ValidateNested()
  @Type(() => Cookies)
  readonly cookies: Cookies;

  @IsArray()
  readonly grant_types_supported: GrantType[];

  @IsObject()
  @ValidateNested()
  @Type(() => Features)
  readonly features: Features;

  @IsBoolean()
  readonly acceptQueryParamAccessTokens: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => Ttl)
  readonly ttl: Ttl;

  /** @TODO fix authorized values */
  @IsArray()
  readonly acrValues: string[];

  @IsObject()
  readonly claims: any;

  @IsObject()
  @ValidateNested()
  @Type(() => ClientDefaults)
  readonly clientDefaults: ClientDefaults;

  @IsArray()
  @IsString({ each: true })
  responseTypes: ResponseType[];

  @IsObject()
  @ValidateNested()
  @Type(() => WhitelistedJWA)
  readonly whitelistedJWA: WhitelistedJWA;

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

  /**
   * `logoutSource` is a function.
   * This is not something that should live in a DTO.
   * Although this is the way `oidc-provider` library offers
   * to implement our logout service
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#logoutsource
   *
   * This property is optional because it is injected by the module
   * rather than by real configuration.
   */
  @IsOptional()
  readonly logoutSource?: any;

  @IsObject()
  @ValidateNested()
  @Type(() => Jwks)
  @IsOptional()
  readonly jwks?: Jwks;
}

export class OidcProviderConfig {
  @IsString()
  readonly prefix: string;

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
