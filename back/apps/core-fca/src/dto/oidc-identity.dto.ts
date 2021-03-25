import { IsSafeString } from '@fc/common';
import { Expose } from 'class-transformer';
import { IsAscii, IsOptional, MaxLength, MinLength } from 'class-validator';
import { MandatoryIdentityDto } from './mandatory-identity.dto';

export class OidcIdentityDto extends MandatoryIdentityDto {
  /**
   * @todo Faire un validator pour siren
   */
  @IsSafeString()
  @IsOptional()
  @Expose()
  readonly siren?: string;

  /**
   * @todo Faire un validator pour siret
   */
  @IsSafeString()
  @IsOptional()
  @Expose()
  readonly siret?: string;

  @IsSafeString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  // oidc naming convention
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly organizational_unit?: string;

  @IsSafeString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  // oidc naming convention
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly belonging_population?: string;

  @IsAscii()
  @IsOptional()
  @Expose()
  // oidc naming convention
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly phone_number?: string;

  @IsSafeString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  readonly 'chorusdt:societe'?: string;

  @IsSafeString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  readonly 'chorusdt:matricule'?: string;
}
