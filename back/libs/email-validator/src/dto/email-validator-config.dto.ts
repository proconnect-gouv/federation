import { IsArray, IsBoolean } from "class-validator";

export class EmailValidatorConfig {
  @IsArray()
  readonly domainWhitelist!: string[];

  @IsBoolean()
  readonly featureMxResolutionValidation!: boolean;
}
