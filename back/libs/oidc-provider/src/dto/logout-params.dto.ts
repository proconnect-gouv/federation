import { IsOptional, IsString, Matches } from 'class-validator';

const URL_REGEX = /^https?:\/\/[^/].+$/;

/**
 * Control parameters on the authentication request.
 * @see https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.3.1.2.1
 */
export class LogoutParamsDto {
  @IsString()
  @IsOptional()
  readonly id_token_hint?: string;

  @Matches(URL_REGEX)
  @IsOptional()
  readonly post_logout_redirect_uri?: string;

  @IsString()
  @IsOptional()
  readonly state?: string;

  @IsString()
  @IsOptional()
  readonly client_id?: string;

  @IsString()
  @IsOptional()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly logout_hint?: string;

  @IsString()
  @IsOptional()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly ui_locales?: string;
}
