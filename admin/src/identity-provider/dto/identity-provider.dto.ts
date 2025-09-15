import {
  IsNumber,
  IsString,
  IsBoolean,
  Matches,
  IsIn,
  IsOptional,
  ValidateIf,
  IsArray,
  IsUrl,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  IsOptionalExtended,
  IsValidInputString,
  IsOptionalArrayExtended,
} from '../../utils/validators';
import { toBoolean, linesToArray, toArray } from '../../utils/transforms';

// tslint:disable-next-line:max-line-length
const URL_REGEX =
  /^((https?:\/\/)?((([^\s\/$.?#]{1,})(\.[^\s\/$?#]{2,})*\.[a-z]{2,})|(([0-9]{1,3}\.){3}[0-9]{1,3})|localhost)(:[0-9]{2,5})?(\/[^\s\/$]+)*\/?)$/;
const EMAIL_REGEX = /^([a-zA-Z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,10})$/;
const FQDN_REGEX = /^([\da-z\.-]+)\.([a-z\.]{2,10})$/;
const IMG_REGEX = /\.(png|svg|jpg|gif)$/;

export class IdentityProviderDTO {
  @IsValidInputString({
    message: `Veuillez mettre un nom valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
  })
  readonly name: string;

  @IsValidInputString({
    message: `Veuillez mettre un titre valide ( majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
  })
  readonly title: string;

  @Matches(URL_REGEX, {
    message:
      'Veuillez mettre une url valide ( Ex: https://my-issuer-url.com/ )',
  })
  readonly issuer: string;

  /**
   * @TODO remplacer jwksUrl par jwksUri pour harmoniser avec la partie service-provider
   * et être plus openid compliant dans le nommage des variables
   */
  @ValidateIf((i) => i.discovery === false)
  @Matches(URL_REGEX, {
    message: 'Veuillez mettre une url valide ( Ex: https://my-jwks-url.com/ )',
  })
  @IsOptional()
  readonly jwksUrl?: string;

  @ValidateIf((i) => i.discovery === false)
  @Matches(URL_REGEX, {
    message:
      'Veuillez mettre une url valide ( Ex: https://my-authorization-url.com/ )',
  })
  readonly authorizationUrl?: string;

  @ValidateIf((i) => i.discovery === false)
  @Matches(URL_REGEX, {
    message: 'Veuillez mettre une url valide ( Ex: https://my-token-url.com/ )',
  })
  readonly tokenUrl?: string;

  @ValidateIf((i) => i.discovery === false)
  @Matches(URL_REGEX, {
    message:
      'Veuillez mettre une url valide ( Ex: https://my-user-info-url.com/ )',
  })
  readonly userInfoUrl?: string;

  @IsOptionalExtended()
  @Matches(URL_REGEX, {
    message:
      'Veuillez mettre une url valide ( Ex: https://my-user-logout.com/ )',
  })
  readonly logoutUrl: string;

  @IsOptionalExtended()
  @Matches(URL_REGEX, {
    message:
      'Veuillez mettre une url valide ( Ex: https://my-status-url.com/ )',
  })
  readonly statusUrl: string;

  @ValidateIf((i) => i.discovery === true)
  @Matches(URL_REGEX, {
    message:
      'Veuillez mettre une url valide ( Ex: https://my-user-info-url.com/ )',
  })
  readonly discoveryUrl?: string;

  @Transform(toBoolean)
  @IsBoolean()
  readonly discovery: boolean;

  @Transform(toBoolean)
  @IsBoolean()
  readonly isBeta: boolean;

  @IsString()
  readonly clientId: string;

  @IsString()
  // oidc variable
  // tslint:disable-next-line: variable-name
  readonly client_secret: string;

  @IsOptionalExtended()
  @IsString()
  readonly messageToDisplayWhenInactive: string;

  @IsOptionalExtended()
  @Matches(URL_REGEX, {
    message:
      'Veuillez mettre une url valide ( Ex: https://my-redirect-url.com/ )',
  })
  readonly redirectionTargetWhenInactive: string;

  @IsOptionalExtended()
  @IsString()
  readonly alt: string;

  @IsOptionalExtended()
  @Matches(IMG_REGEX, {
    message:
      "Veuillez saisir un nom d'image valide finissant par .svg, .jpg, .gif, .png",
  })
  readonly image: string;

  @IsOptionalExtended()
  @Matches(IMG_REGEX, {
    message:
      "Veuillez saisir un nom d'image valide finissant par .svg, .jpg, .gif, .png",
  })
  @IsString()
  readonly imageFocus: string;

  @Transform(toBoolean)
  @IsBoolean()
  readonly active: boolean;

  @Transform(toArray)
  @IsString({ each: true })
  @IsArray()
  readonly allowedAcr: string[];

  @IsOptionalExtended()
  @IsNumber()
  @Type(() => Number)
  readonly order: number;

  @IsOptionalArrayExtended()
  @Transform(linesToArray)
  @Matches(EMAIL_REGEX, {
    each: true,
    message: 'Veuillez mettre des emails valides ( Ex: email@email.com )',
  })
  readonly emails?: string[];

  @IsOptionalExtended()
  @IsString()
  readonly specificText: string;

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
  @Transform(toArray)
  @IsArray()
  amr?: string[];

  @IsOptional()
  @Transform(linesToArray)
  @Matches(FQDN_REGEX, {
    each: true,
    message:
      'Veuillez mettre des fqdns valides ( Ex: nom.de-domaine-complet.com )',
  })
  readonly fqdns?: string[];

  @IsBoolean()
  @Transform(toBoolean)
  @IsOptional()
  readonly modalActive?: boolean;

  @ValidateIf(({ modalActive }) => modalActive)
  @IsString()
  readonly modalTitle?: string;

  @ValidateIf(({ modalActive }) => modalActive)
  @IsString()
  readonly modalBody?: string;

  @ValidateIf(({ modalActive }) => modalActive)
  @IsString()
  readonly modalContinueText?: string;

  @ValidateIf(
    ({ modalActive, modalMoreInfoUrl }) =>
      modalActive && modalMoreInfoUrl.length > 0,
  )
  @IsString()
  @IsNotEmpty()
  readonly modalMoreInfoLabel?: string;

  @ValidateIf(
    ({ modalActive, modalMoreInfoLabel }) =>
      modalActive && modalMoreInfoLabel.length > 0,
  )
  @IsUrl()
  readonly modalMoreInfoUrl?: string;

  // only for proconnect
  @IsOptionalExtended()
  @IsString()
  @Length(14, 14)
  readonly siret?: string;

  @IsOptional()
  @IsString()
  readonly supportEmail?: string;
}
