import { IsEmail, IsUrl } from 'class-validator';

export class CoreConfig {
  @IsUrl()
  readonly defaultRedirectUri: string;

  @IsEmail()
  readonly supportEmail: string;
}
