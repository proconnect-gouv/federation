import { Expose, Transform } from 'class-transformer';
import {
  IsAscii,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { isString } from 'lodash';

export class IdentityFromIdpDto {
  @MinLength(1)
  @MaxLength(256)
  @IsAscii()
  @Expose()
  sub: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @Expose()
  given_name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @Expose()
  usual_name: string;

  @IsEmail()
  @Expose()
  email: string;

  @MinLength(1)
  @MaxLength(256)
  @IsAscii()
  @Expose()
  uid: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  siren?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Transform(({ value }) =>
    isString(value) ? value.replace(/\s/g, '') : value,
  )
  @Expose()
  siret?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  organizational_unit?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  belonging_population?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  phone_number?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  'chorusdt:societe'?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @Expose()
  'chorusdt:matricule'?: string;

  @IsBoolean()
  @IsOptional()
  @Expose()
  is_service_public?: boolean;
}
