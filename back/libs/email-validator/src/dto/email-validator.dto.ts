import { IsOptional, IsString } from 'class-validator';

export class EmailValidatorConfig {
  @IsOptional()
  @IsString()
  debounceApiKey = '';
}
