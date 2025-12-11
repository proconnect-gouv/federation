import { Transform } from 'class-transformer';
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
  sub: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  given_name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  usual_name: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @MinLength(1)
  @MaxLength(256)
  @IsAscii()
  uid: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  siren?: string;

  @IsString()
  @MaxLength(256)
  @IsOptional()
  @Transform(({ value }) =>
    isString(value) ? value.replace(/\s/g, '') : value,
  )
  siret?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  organizational_unit?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  belonging_population?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  'chorusdt:societe'?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  'chorusdt:matricule'?: string;

  @IsBoolean()
  @IsOptional()
  is_service_public?: boolean;

  @IsOptional()
  phone_number?: any;
}
