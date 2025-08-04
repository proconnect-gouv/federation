import { UserRole } from '../roles.enum';

/**
 * @interface ICreateUserDTO
 * @property username {String}
 * @property email {String}
 * @property password {string}
 * @property roles {UserRole[]}
 * @property secret {string}
 *
 * @description interface utilisée dans le cadre de la création d'un utilisateur
 */
export interface ICreateUserDTO {
  username: string;
  email: string;
  password: string;
  roles: UserRole[];
  secret: string;
}
