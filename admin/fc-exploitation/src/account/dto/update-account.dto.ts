import { IsNotEmpty } from 'class-validator';
import { IsSameAs } from '../validator/is-same-as.validator';
import { IsCompliant } from '../validator/is-compliant.validator';

export class UpdateAccountDto {
  @IsNotEmpty({ message: 'Le mot de passe doit être renseigné' })
  readonly currentPassword: string;

  @IsNotEmpty({ message: 'Le mot de passe doit être renseigné' })
  @IsCompliant({
    message: 'Le mot de passe saisi est invalide',
  })
  readonly password: string;

  @IsNotEmpty({
    message: 'La confirmation de mot de passe doit être renseignée',
  })
  @IsSameAs('password', {
    message: 'Les mots de passe fournis ne correspondent pas',
  })
  readonly passwordConfirmation: string;

  constructor(
    currentPassword: string,
    password: string,
    passwordConfirmation: string,
  ) {
    this.currentPassword = currentPassword;
    this.password = password;
    this.passwordConfirmation = passwordConfirmation;
  }
}
