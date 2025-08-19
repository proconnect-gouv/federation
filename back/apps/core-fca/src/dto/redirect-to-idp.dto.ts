import { Transform } from 'class-transformer';
import {
  IsAscii,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

import { CrsfToken } from '@fc/oidc-client';

export class RedirectToIdp extends CrsfToken {
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsOptional()
  @IsAscii()
  readonly identityProviderUid?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'on', { toClassOnly: true })
  readonly rememberMe?: boolean;
}
