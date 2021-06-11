import { IsOptional, IsString } from 'class-validator';

export class AppConfig {
  @IsString()
  readonly name: string;

  /**
   * @TODO #195
   * ETQ dev, je check le préfix d'url
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/195
   */
  @IsString()
  readonly urlPrefix: string;

  @IsOptional()
  @IsString()
  readonly fqdn?: string;
}
