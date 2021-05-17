import { AppConfig as AppGenericConfig } from '@fc/app';
import { IsString } from 'class-validator';

export class AppConfig extends AppGenericConfig {
  @IsString()
  readonly defaultAcrValue: string;
}
