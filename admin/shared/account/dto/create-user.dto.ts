/* istanbul ignore file */

// Declarative code
import { UserRole } from '@fc/shared/user/roles.enum';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsEmail,
  ArrayNotEmpty,
  ArrayUnique,
  IsString,
  IsEnum,
  Matches,
} from 'class-validator';
import { IsCompliant } from '../validator/is-compliant.validator';

export class CreateUserDto {
  @IsNotEmpty({ message: "Le nom d'utilisateur doit être renseigné" })
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: `Veuillez mettre un nom d'utilisateur ( Majuscule, minuscule, nombres et trait d'union, sans espace)`,
  })
  readonly username: string;

  @IsNotEmpty({ message: "L'email doit être renseigné" })
  @IsEmail(
    {},
    {
      message:
        'Veuillez mettre une adresse email valide ( Ex: email@email.com )',
    },
  )
  readonly email: string;

  @IsNotEmpty({ message: 'Le mot de passe doit être renseigné' })
  @IsCompliant({
    message: 'Le mot de passe saisi est invalide',
  })
  readonly password: string;

  @ArrayNotEmpty({ message: 'Veuillez renseigner au moins un rôle' })
  @ArrayUnique()
  @IsEnum(UserRole, {
    each: true,
    message: 'Veuillez renseigner des rôles valides',
  })
  @Transform(value => (typeof value === 'string' ? [value] : value))
  readonly roles: UserRole[];

  @IsString()
  readonly secret: string;

  constructor(
    username: string,
    email: string,
    password: string,
    roles: UserRole[],
    secret: string,
  ) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.roles = roles;
    this.secret = secret;
  }
}
