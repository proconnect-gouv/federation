import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { isString } from 'lodash';

import { BaseIdentityDto } from 'apps/core/src/dto/base-identity.dto';

export class IdentityFromIdpDto extends BaseIdentityDto {
  @IsOptional()
  @Transform(({ value }) =>
    isString(value) ? value.replace(/\s/g, '') : value,
  )
  siret?: string;
}
