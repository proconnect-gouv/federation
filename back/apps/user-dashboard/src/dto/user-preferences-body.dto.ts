/* istanbul ignore file */

// Declarative code
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

import { enforceArray } from '@fc/common';

export class UserPreferencesBodyDto {
  @Transform(enforceArray)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  includeList: string[];
}
