import { IsString, Length, IsAscii } from 'class-validator';

export class RedirectToIdp {
  @IsString()
  @IsAscii()
  @Length(21, 21)
  readonly uid: string;

  @IsString()
  @IsAscii()
  readonly scope: string;

  @IsString()
  @IsAscii()
  readonly providerUid: string;

  @IsString()
  @IsAscii()
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly acr_values: string;
}
