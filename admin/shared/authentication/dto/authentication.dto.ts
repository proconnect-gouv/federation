import { IsNotEmpty, Matches, IsNumber } from 'class-validator';
import { IsCompliant } from '@fc/shared/account/validator/is-compliant.validator';

export class AuthenticationDto {
  @IsNotEmpty({ message: "Le nom d'utilisateur doit être renseigné" })
  @Matches(/^[A-Za-z0-9-]{6,}$/, {
    message: `Veuillez mettre un nom d'utilisateur ( Majuscule, minuscule, nombres et trait d'union, sans espace)`,
  })
  readonly username: string;

  @IsNotEmpty({ message: 'Le mot de passe doit être renseigné' })
  @IsCompliant({
    message: 'Le mot de passe saisi est invalide',
  })
  readonly password: string;

  @IsNotEmpty({ message: 'Le TOTP doit être renseigné' })
  @IsNumber()
  @Matches(/^[\d]{6}+$/, {
    message: `Le TOTP de passe saisi est invalide`,
  })
  // tslint:disable-next-line: variable-name
  readonly _totp: string;
}
