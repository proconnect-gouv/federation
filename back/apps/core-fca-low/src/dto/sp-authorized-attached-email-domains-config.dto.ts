import { IsArray, IsString } from "class-validator";

export class SpAuthorizedAttachedEmailDomainsConfig {
  @IsString()
  readonly spId: string;

  @IsString()
  readonly spName: string;

  @IsString()
  readonly spContact: string;

  @IsArray()
  @IsString({ each: true })
  readonly authorizedAttachedEmailDomains: string[];
}
