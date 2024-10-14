/* istanbul ignore file */

// Declarative code
import { IsOptional, IsString } from 'class-validator';

export class AppSession {
  @IsOptional()
  @IsString()
  readonly mode?: string;
}
