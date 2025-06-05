import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { isString } from 'lodash';

import { BaseIdentityDto } from './base-identity.dto';

export class IdentityFromIdpDto extends BaseIdentityDto {
  @IsString()
  @MinLength(1)
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
  phone_number?: string;
}
