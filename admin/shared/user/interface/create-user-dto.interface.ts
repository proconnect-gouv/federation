import { UserRole } from '../roles.enum';

export interface ICreateUserDTO {
  username: string;
  email: string;
  password: string;
  roles: UserRole[];
  secret: string;
}
