import { Expose } from 'class-transformer';
import {
  IsAscii,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsSiret } from '../validators/is-siret-validator';

export class IdentityFromIdpDto {
  @MinLength(1)
  @IsAscii()
  @Expose()
  readonly sub!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @Expose()
  readonly given_name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @Expose()
  readonly usual_name: string;

  @IsEmail()
  @Expose()
  readonly email: string;

  @MinLength(1)
  @IsAscii()
  @Expose()
  readonly uid: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  readonly siren?: string;

  @IsSiret()
  @Expose()
  siret?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  readonly organizational_unit?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  readonly belonging_population?: string;

  @IsString()
  @IsOptional()
  @Expose()
  phone_number?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  readonly 'chorusdt'?: string;

  @IsBoolean()
  @IsOptional()
  @Expose()
  readonly is_service_public?: boolean;
}
