/* istanbul ignore file */

// Declarative code
import { IsEmail, IsString } from 'class-validator';

export class Identity {
  @IsString()
  readonly uid: string;

  @IsString()
  // OIDC claim
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly identity_provider: string;

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
  readonly family_name: string;

  @IsString()
  readonly gender: string;

  @IsString()
  readonly birthdate: string;

  @IsString()
  readonly birthcountry: string;

  @IsString()
  readonly birthplace: string;

  @IsString()
  // OIDC claim
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly belonging_population: string;

  @IsString()
  readonly siret: string;

  @IsString()
  readonly position: string;

  @IsString()
  readonly job: string;

  @IsString()
  readonly phone: string;

  @IsString()
  readonly address: string;

  @IsString()
  // OIDC claim
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly preferred_username: string;
}
