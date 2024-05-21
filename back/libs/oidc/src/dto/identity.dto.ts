import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * @see https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.5.1
 */
export class OidcIdentityDto {
  @IsString()
  @IsOptional()
  sub?: string;

  @IsString()
  given_name: string;

  @IsString()
  family_name: string;

  @IsString()
  birthdate: string;

  @IsString()
  gender: string;

  @IsString()
  birthplace: string;

  @IsString()
  birthcountry: string;

  @IsString()
  @IsOptional()
  preferred_username?: string;

  @IsEmail()
  email: string;
}
