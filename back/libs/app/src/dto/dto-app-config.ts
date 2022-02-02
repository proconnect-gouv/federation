/* istanbul ignore file */

// Declarative code
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

class HttpsOptions {
  @IsString()
  @MinLength(1)
  @IsOptional()
  readonly key?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  readonly cert?: string;
}

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

  @ValidateNested()
  @Type(() => HttpsOptions)
  readonly httpsOptions: HttpsOptions;

  @IsOptional()
  @IsString()
  readonly fqdn?: string;
}
