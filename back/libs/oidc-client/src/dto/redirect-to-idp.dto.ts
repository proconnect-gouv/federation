import { IsString, IsAscii, IsOptional } from 'class-validator';

export class RedirectToIdp {
  @IsString()
  @IsAscii()
  readonly providerUid: string;

  @IsString()
  @IsOptional()
  readonly scope: string;

  @IsString()
  @IsOptional()
  readonly claims: string;

  @IsString()
  @IsAscii()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly acr_values: string;
}
