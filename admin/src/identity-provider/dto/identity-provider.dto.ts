import {
  IsString,
  IsBoolean,
  Matches,
  IsIn,
  IsOptional,
  ValidateIf,
  IsArray,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsOptionalExtended, IsValidInputString } from '../../utils/validators';
import { toBoolean, linesToArray } from '../../utils/transforms';
import { IsUrlExtended } from '../../utils/validators/is-url-extended.validator';

const FQDN_REGEX = /^([\da-z\.-]+)\.([a-z\.]{2,10})$/;

export class IdentityProviderDTO {
  @IsValidInputString({
    message: `Veuillez mettre un nom valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
  })
  readonly name: string;

  @IsValidInputString({
    message: `Veuillez mettre un titre valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
  })
  readonly title: string;

  @IsUrlExtended({
    message:
      'Veuillez mettre une url valide ( Ex: https://my-issuer-url.com/ )',
  })
  readonly issuer: string;

  /**
   * @TODO remplacer jwksUrl par jwksUri pour harmoniser avec la partie service-provider
   * et être plus openid compliant dans le nommage des variables
   */
  @ValidateIf((i) => i.discovery === false)
  @IsUrlExtended({
    message: 'Veuillez mettre une url valide ( Ex: https://my-jwks-url.com/ )',
  })
  @IsOptional()
  readonly jwksUrl?: string;

  @ValidateIf((i) => i.discovery === false)
  @IsUrlExtended({
    message:
      'Veuillez mettre une url valide ( Ex: https://my-authorization-url.com/ )',
  })
  readonly authorizationUrl?: string;

  @ValidateIf((i) => i.discovery === false)
  @IsUrlExtended({
    message: 'Veuillez mettre une url valide ( Ex: https://my-token-url.com/ )',
  })
  readonly tokenUrl?: string;

  @ValidateIf((i) => i.discovery === false)
  @IsUrlExtended({
    message:
      'Veuillez mettre une url valide ( Ex: https://my-user-info-url.com/ )',
  })
  readonly userInfoUrl?: string;

  @IsOptionalExtended()
  @IsUrlExtended({
    message:
      'Veuillez mettre une url valide ( Ex: https://my-user-logout.com/ )',
  })
  readonly logoutUrl: string;

  @IsOptionalExtended()
  @IsUrlExtended({
    message:
      'Veuillez mettre une url valide ( Ex: https://my-status-url.com/ )',
  })
  readonly statusUrl: string;

  @ValidateIf((i) => i.discovery === true)
  @IsUrlExtended({
    message:
      'Veuillez mettre une url valide ( Ex: https://my-user-info-url.com/ )',
  })
  readonly discoveryUrl?: string;

  @Transform(toBoolean)
  @IsBoolean()
  readonly discovery: boolean;

  @IsString()
  readonly clientId: string;

  @IsString()
  // oidc variable
  // tslint:disable-next-line: variable-name
  readonly client_secret: string;

  @Transform(toBoolean)
  @IsBoolean()
  readonly active: boolean;

  @IsOptional()
  @IsIn(['', 'A256GCM'], {
    message:
      '<strong>userinfo_encrypted_response_enc</strong> doit être une des valeurs suivantes: A256GCM',
  })
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  readonly userinfo_encrypted_response_enc?: string;

  @IsOptional()
  @IsIn(['', 'ECDH-ES', 'RSA-OAEP', 'RSA-OAEP-256'], {
    message:
      '<strong>userinfo_encrypted_response_alg</strong> doit être une des valeurs suivantes: ECDH-ES, RSA-OAEP, RSA-OAEP-256',
  })
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  readonly userinfo_encrypted_response_alg?: string;

  @IsOptional()
  @IsIn(['', 'ES256', 'RS256', 'HS256'], {
    message:
      '<strong>userinfo_signed_response_alg</strong> doit être une des valeurs suivantes: ES256, RS256, HS256 ou ""',
  })
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  readonly userinfo_signed_response_alg?: 'HS256' | 'RS256' | 'ES256' | '';

  @IsOptional()
  @IsIn(['', 'ES256', 'RS256', 'HS256'], {
    message:
      '<strong>id_token_signed_response_alg</strong> doit être une des valeurs suivantes: ES256, RS256 ou HS256',
  })
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  readonly id_token_signed_response_alg?: 'HS256' | 'RS256' | 'ES256';

  @IsOptional()
  @IsIn(['', 'ECDH-ES', 'RSA-OAEP', 'RSA-OAEP-256'], {
    message:
      '<strong>id_token_encrypted_response_alg</strong> doit être une des valeurs suivantes: ECDH-ES, RSA-OAEP, RSA-OAEP-256',
  })
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  readonly id_token_encrypted_response_alg?: string;

  @IsOptional()
  @IsIn(['', 'A256GCM'], {
    message:
      '<strong>id_token_encrypted_response_enc</strong> doit être une des valeurs suivantes: A256GCM',
  })
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  readonly id_token_encrypted_response_enc?: string;

  @IsOptional()
  @IsIn(['client_secret_post'], {
    message:
      '<strong>token_endpoint_auth_method</strong> doit être une des valeurs suivantes: client_secret_post',
  })
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  readonly token_endpoint_auth_method?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  readonly redirect_uris?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  readonly post_logout_redirect_uris?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    linesToArray({ value }, { shouldDeleteDuplicates: true }),
  )
  @Matches(FQDN_REGEX, {
    each: true,
    message:
      'Veuillez mettre des fqdns valides ( Ex: nom.de-domaine-complet.com )',
  })
  readonly fqdns?: string[];

  @IsOptionalExtended()
  @IsString()
  @Length(14, 14)
  readonly siret?: string;

  @IsOptional()
  @IsString()
  readonly supportEmail?: string;

  @Transform(toBoolean)
  @IsBoolean()
  readonly isRoutingEnabled: boolean;
}
