import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  ValidateNested,
} from "class-validator";

const IPV4_WITH_RANGE_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\/(?:3[0-2]|[12]?\d)$/;

import { AppConfig as AppGenericConfig } from "#libs/app";
import { ContentSecurityPolicy } from "./content-secury-policy.dto";
import { SpAuthorizedAttachedEmailDomainsConfig } from "./sp-authorized-attached-email-domains-config.dto";

export class AppConfig extends AppGenericConfig {
  @IsString()
  readonly defaultIdpId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpAuthorizedAttachedEmailDomainsConfig)
  readonly spAuthorizedAttachedEmailDomainsConfigs: SpAuthorizedAttachedEmailDomainsConfig[];

  @IsString()
  readonly defaultEmailRenater: string;

  @ValidateNested()
  @Type(() => ContentSecurityPolicy)
  readonly contentSecurityPolicy: ContentSecurityPolicy;

  @IsUrl()
  readonly defaultRedirectUri: string;

  @IsEmail()
  readonly supportEmail: string;

  @IsString()
  readonly idpRoutingForcingEmailSuffix: string;

  @IsString()
  readonly idpMfaComplianceForcingEmailSuffix: string;

  @IsBoolean()
  @IsOptional()
  readonly displayTestEnvWarning?: boolean;

  @IsBoolean()
  @IsOptional()
  readonly displayMaintenanceNotice?: boolean;

  @IsString()
  @IsOptional()
  readonly maintenanceDatetime?: string;

  @IsString()
  @IsOptional()
  readonly maintenanceDuration?: string;

  @IsArray()
  @Matches(IPV4_WITH_RANGE_REGEX, { each: true })
  readonly rieIpRanges: string[];
}
