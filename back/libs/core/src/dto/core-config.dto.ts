import { IsArray, IsEmail, IsString, IsUrl } from 'class-validator';

export class CoreConfig {
  @IsUrl()
  readonly defaultRedirectUri: string;

  @IsArray()
  @IsString({ each: true })
  readonly allowedIdpHints: string[];

  @IsEmail()
  readonly supportEmail: string;
}
