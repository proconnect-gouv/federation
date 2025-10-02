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

import { IdentityForSpDto } from './identity-for-sp.dto';
import { IdentityFromIdpDto } from './identity-from-idp.dto';

// Properties annotated with @Expose will be the only ones included during cookie renewal/duplication.
export class UserSession {
  @IsOptional()
  @IsUUID(4)
  @Expose()
  readonly browsingSessionId?: string;

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
  @Expose()
  readonly spEssentialAcr?: string;

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

  @IsOptional()
  @IsObject()
  @Expose()
  readonly spIdentity?: IdentityForSpDto;

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

  @IsOptional()
  @IsObject()
  @Expose()
  readonly idpIdentity?: IdentityFromIdpDto;

  @IsOptional()
  @IsString()
  readonly oidcProviderLogoutForm?: string;

  /**
   * @deprecated
   */
  @IsOptional()
  @IsString()
  readonly login_hint?: string;

  @IsOptional()
  @IsString()
  readonly spLoginHint?: string;

  @IsOptional()
  @IsString()
  readonly idpLoginHint?: string;

  @IsOptional()
  @IsBoolean()
  readonly rememberMe?: boolean;
}
