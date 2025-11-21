import {
  IsAscii,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const URL_REGEX = /^https?:\/\/[^/].+$/;

/**
 * Control parameters on the authentication request.
 * @see https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.3.1.2.1
 */
export class AuthorizeParamsDto {
  @IsString()
  readonly client_id: string;

  @IsOptional()
  @IsString()
  readonly acr_values?: string;

  @IsOptional()
  @IsString()
  readonly claims?: string;

  @IsString()
  readonly response_type: string;

  @IsOptional()
  @IsString()
  readonly response_mode: string;

  @IsOptional()
  @IsString()
  @IsAscii({ message: 'Le nonce doit être composé de caractères ASCII' })
  @Length(1, 512)
  readonly nonce?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Le login_hint doit être une adresse email valide' })
  readonly login_hint?: string;

  @IsOptional()
  @Length(14, 14, { message: 'Le siret_hint doit contenir 14 caractères' })
  readonly siret_hint?: string;

  @IsString()
  readonly state: string;

  @Matches(URL_REGEX)
  readonly redirect_uri: string;

  // The openid verification is made into oidc-provider
  @IsString()
  readonly scope: string;

  @IsOptional()
  @IsString()
  readonly prompt?: string;

  @IsOptional()
  @IsString()
  readonly idp_hint?: string;

  @IsOptional()
  @IsString()
  readonly code_challenge?: string;

  @IsOptional()
  @IsString()
  readonly code_challenge_method?: string;
}
