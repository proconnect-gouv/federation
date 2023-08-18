/* istanbul ignore file */

// Declarative code
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

import { AppConfig as AppGenericConfig } from '@fc/app';

export class AppConfig extends AppGenericConfig {
  @IsString()
  @IsNotEmpty()
  readonly idpId: string;

  @IsOptional()
  @IsString()
  readonly dataApiUrl?: string;

  @ValidateIf((o) => o.dataApiUrl)
  @IsString()
  readonly dataApiAuthSecret?: string;
}
