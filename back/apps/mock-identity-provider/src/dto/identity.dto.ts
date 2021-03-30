/* istanbul ignore file */

// Declarative code
import { IsEmail, IsString } from 'class-validator';

export class Identity {
  @IsString()
  readonly uid: string;

  @IsString()
  // OIDC claim
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly organizational_unit: string;

  @IsString()
  readonly siren: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  // OIDC claim
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly usual_name: string;

  @IsString()
  // OIDC claim
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly given_name: string;

  @IsString()
  // OIDC claim
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly belonging_population: string;

  @IsString()
  readonly siret: string;

  @IsString()
  readonly phone: string;

  @IsString()
  readonly 'chorusdt': string;
}
