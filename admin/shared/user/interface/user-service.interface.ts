import { DeleteResult, UpdateResult } from 'typeorm';
import { User } from '../user.sql.entity';
import { ICreateUserDTO } from './create-user-dto.interface';
import { IEnrollUserDto } from './enroll-user-dto.interface';
import { IUserPasswordUpdateDTO } from './user-password-update-dto.interface';

export interface IUserService {
  generateTmpPass();
  updateUserAccount(user, data: IUserPasswordUpdateDTO): Promise<UpdateResult>;
  enrollUser(user, enrollmentPassword: IEnrollUserDto): Promise<UpdateResult>;
  findByUsername(username: string): Promise<User>;
  compareHash(password: string, hash: string): Promise<boolean>;
  createUser(user: ICreateUserDTO, author: string): Promise<User>;
  deleteUserById(id: string, user: string): Promise<DeleteResult>;
  isEqualToTemporaryPassword(
    newPassword: string,
    temporaryPasswordHash: string,
  ): Promise<boolean>;
  isEqualToOneOfTheLastFivePasswords(
    currentUsername: string,
    password: string,
  ): Promise<boolean>;
}
