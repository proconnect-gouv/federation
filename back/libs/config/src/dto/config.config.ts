import { IsObject, IsOptional } from 'class-validator';

import { type TemplateExposedType } from '../types';

export class ConfigConfig {
  @IsObject()
  @IsOptional()
  readonly templateExposed?: TemplateExposedType;
}
