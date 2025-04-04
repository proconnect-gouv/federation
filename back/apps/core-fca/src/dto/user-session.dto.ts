import { Expose } from 'class-transformer';
import {
  IsArray,
  IsAscii,
  IsBoolean,
  IsJWT,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { PartialExcept } from '@fc/common';
import { IOidcIdentity } from '@fc/oidc/interfaces';

// Properties annotated with @Expose will be the only ones included during cookie renewal/duplication.
export class UserSession {
  @IsOptional()
  @IsUUID(4)
  @Expose()
  readonly browsingSessionId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly accountId?: string;

  @IsOptional()
  @IsAscii()
  @IsNotEmpty()
  @Expose()
  readonly interactionId?: string;

  @IsOptional()
  @IsBoolean()
  @Expose()
  readonly reusesActiveSession?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly interactionAcr?: string;

  @IsOptional()
  @IsArray()
  @Expose()
  readonly amr?: string[];

  @IsOptional()
  @IsBoolean()
  @Expose()
  readonly isSilentAuthentication?: boolean;

  // == SP

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly spId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly spName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  // @IsUrlRequiredTldFromConfig()
  @Expose()
  readonly spRedirectUri?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly spAcr?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly spState?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  @Expose()
  readonly spScope?: string[];

  /**
   * @todo #485 This section require a deep type validation
   * It should be done in a session integrity validation ticket
   * that handle errors in case one of the session's member
   * is not valid.
   * @author Brice
   * @date 2021-04-21
   * @ticket #FC-485
   * @sample
   *   @ValidateNested()
   *   @Type (() => IOidcIdentity)
   *   readonly spIdentity?: IOidcIdentity;
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/485
   */
  @IsOptional()
  @IsObject()
  @Expose()
  readonly spIdentity?: Partial<Omit<IOidcIdentity, 'sub'>>;

  // == IdP

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly idpId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly idpName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly idpLabel?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly idpAcr?: string;

  @IsOptional()
  @IsString()
  @IsJWT()
  @Expose()
  readonly idpIdToken?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly idpState?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly idpNonce?: string;

  /**
   * @todo #485 This section require a deep type validation
   * It should be done in a session integrity validation ticket
   * that handle errors in case one of the session's member
   * is not valid.
   * @author Brice
   * @date 2021-04-21
   * @ticket #FC-485
   * @sample
   *   @ValidateNested()
   *   @Type (() => IOidcIdentity)
   *   readonly idpIdentity?: IOidcIdentity;
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/485
   */
  @IsOptional()
  @IsObject()
  @Expose()
  readonly idpIdentity?: PartialExcept<IOidcIdentity, 'sub'> | IOidcIdentity;

  @IsOptional()
  @IsObject()
  readonly subs?: Record<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly idpRepresentativeScope?: string[];

  @IsOptional()
  @IsString()
  readonly oidcProviderLogoutForm?: string;

  @IsOptional()
  @IsString()
  readonly login_hint?: string;
}
