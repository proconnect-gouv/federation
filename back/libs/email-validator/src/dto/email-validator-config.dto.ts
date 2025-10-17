import { IsArray } from 'class-validator';

export class EmailValidatorConfig {
  @IsArray()
  readonly domainWhitelist: string[];
}
