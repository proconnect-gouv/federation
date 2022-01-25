/* istanbul ignore file */

// Declarative code
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class IdpSettingsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  includeList: string[];
}
