import * as bcrypt from 'bcrypt';
import { Repository, DeleteResult, UpdateResult } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { InjectConfig, ConfigService } from 'nestjs-config';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserRole } from '@fc/shared/user/roles.enum';
import { LoggerService } from '@fc/shared/logger/logger.service';

import { IsPasswordCompliant } from '../account/validator/is-compliant.validator';
import { MailerService } from '../mailer/mailer.service';
import { Email } from '../mailer/mailer.types';
import { IMailerParams } from '../mailer/interfaces';

import { User } from './user.sql.entity';
import { Password } from './password.sql.entity';
import { IUserPasswordUpdateDTO } from './interface/user-password-update-dto.interface';
import { IEnrollUserDto } from './interface/enroll-user-dto.interface';
import { IUserService } from './interface/user-service.interface';
import { ICreateUserDTO } from './interface/create-user-dto.interface';
import { IUserTrack } from './interface/user-track.interface';

@Injectable()
export class UserService implements IUserService {
  private readonly SALT_ROUNDS = 10;
  private readonly userTokenExpiresIn;

  constructor(
    @Inject('generatePassword') private readonly generatePassword,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Password)
    private readonly passwordRepository: Repository<Password>,
    private readonly logger: LoggerService,
    @InjectConfig() private readonly config: ConfigService,
    private readonly transporterService: MailerService,
  ) {
    this.userTokenExpiresIn =
      this.config.get('app').userTokenExpiresIn * 60 * 1000;
  }

  private track(log: IUserTrack) {
    this.logger.businessEvent({ entity: 'user', ...log });
  }

  callGeneratePassword() {
    return this.generatePassword.generate({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
      excludeSimilarCharacters: true,
      strict: true,
    });
  }

  generateTmpPass() {
    const validator = new IsPasswordCompliant();
    let temporaryPassword = '';
    let i = 0;
    while (i < 10) {
      temporaryPassword = this.callGeneratePassword();
      if (validator.validate(temporaryPassword)) {
        return temporaryPassword;
      }
      i += 1;
    }
    return 'The password could not be generated, please try again';
  }

  passwordDoesNotContainUsername(password: string, username: string) {
    const lowerCasePassword = password.toLowerCase();
    return lowerCasePassword.includes(username) ? false : true;
  }

  async enrollUser(
    user,
    enrollmentPassword: IEnrollUserDto,
  ): Promise<UpdateResult> {
    const roles = user.roles
      .filter(role => role !== 'new_account')
      .map(role => role.replace('inactive_', ''));

    this.track({
      action: 'enroll',
      user: user.username,
      id: user.id,
      name: user.email,
    });

    try {
      return await this.updatePassword(user, enrollmentPassword.password, {
        roles,
      });
    } catch (err) {
      throw new Error('password could not be updated');
    }
  }

  async updateUserAccount(
    user,
    data: IUserPasswordUpdateDTO,
  ): Promise<UpdateResult> {
    const isValidPassword = await this.compareHash(
      data.currentPassword,
      user.passwordHash,
    );

    if (isValidPassword) {
      try {
        return await this.updatePassword(user, data.password, {});
      } catch (err) {
        throw new Error('password could not be updated');
      }
    } else {
      throw new Error(
        'password could not be updated because old password is invalid',
      );
    }
  }

  async findByUsername(username: string): Promise<User> {
    let user;
    try {
      user = await this.userRepository.findOne({ username });
      return user;
    } catch (e) {
      this.logger.error(e);
      throw new Error('The user could not be found due to a database error');
    }
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createUser(user: ICreateUserDTO, author: string): Promise<User> {
    const { appFqdn } = this.config.get('app');
    const { username, email, roles, secret } = user;
    const token: string = uuid();

    let passwordHash;
    const updatedAt = new Date();
    try {
      passwordHash = await bcrypt.hash(user.password, this.SALT_ROUNDS);
    } catch (err) {
      throw new Error('password hash could not be generated');
    }

    try {
      await this.sendNewAccountEmail(
        { username, email },
        {
          templateName: 'enrollment',
          variables: {
            appFqdn,
            token,
          },
        },
      );
    } catch (error) {
      throw new Error(
        `Sending email failed. Abandonment of user creation : ${error}`,
      );
    }
    try {
      const {
        tokenCreatedAt,
        tokenExpiresAt,
      } = this.setAuthenticationTokenExpirationDate();

      const enrolledUser = await this.userRepository.save({
        passwordHash,
        username,
        email,
        roles,
        secret,
        token,
        tokenCreatedAt,
        tokenExpiresAt,
      });

      await this.savePassword(username, passwordHash, updatedAt);

      this.track({
        action: 'create',
        user: author,
        name: email,
      });

      return enrolledUser;
    } catch (err) {
      throw new Error('The user could not be saved');
    }
  }

  async blockUser(username): Promise<User> {
    let blockedUser;

    try {
      blockedUser = await this.userRepository.findOne({ username });

      await this.userRepository.update(
        { username },
        { roles: [UserRole.BLOCKED_USER] },
      );
    } catch (e) {
      this.logger.error(e);
      throw new Error('The user could not be blocked due to a database error');
    }

    this.track({
      action: 'block',
      user: username,
      id: blockedUser.id,
      name: blockedUser.email,
    });

    return blockedUser;
  }

  async deleteUserById(id: string, author: string): Promise<DeleteResult> {
    const user = await this.userRepository.findOne(id);

    const result = await this.userRepository.delete({ id });

    this.track({
      action: 'delete',
      user: author,
      id,
      name: user.email,
    });

    return result;
  }

  async updatePassword(
    { username, id, email },
    password,
    userData,
  ): Promise<UpdateResult> {
    this.track({
      action: 'updatePassword',
      user: username,
      id,
      name: email,
    });

    const newPasswordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    let userEntity;

    try {
      const updatedAt = new Date();
      await this.savePassword(username, newPasswordHash, updatedAt);
      userEntity = await this.findByUsername(username);
      userEntity.passwordHash = newPasswordHash;
      Object.assign(userEntity, userData);
      await this.userRepository.update(id, userEntity);
    } catch (err) {
      throw new Error('password could not be updated');
    }

    return userEntity;
  }

  sendNewAccountEmail({ username, email }, options: IMailerParams) {
    return this.transporterService.send(
      this.createRecipients(username, email),
      options,
    );
  }

  createRecipients(username: string, email: string): Email.SendParamsMessage {
    const { appName } = this.config.get('app');
    const { smtpSenderName, smtpSenderEmail } = this.config.get('transporter');

    return {
      From: {
        Email: smtpSenderEmail,
        Name: smtpSenderName,
      },
      To: [
        {
          Email: email,
          Name: username,
        },
      ],
      Subject: `Demande de création d'un compte utilisateur sur ${appName}`,
    };
  }

  private setAuthenticationTokenExpirationDate() {
    const now = new Date();
    const tokenCreatedAt = now;
    const tokenExpiresAt = new Date(now.getTime() + this.userTokenExpiresIn);

    return { tokenCreatedAt, tokenExpiresAt };
  }

  async isEqualToTemporaryPassword(
    newPassword: string,
    temporaryPasswordHash: string,
  ): Promise<boolean> {
    const compareHash = await this.compareHash(
      newPassword,
      temporaryPasswordHash,
    );

    return compareHash;
  }

  async isEqualToOneOfTheLastFivePasswords(
    currentUsername: string,
    password: string,
  ): Promise<boolean> {
    const updatedAt: Date = new Date();
    let isSame: boolean = false;
    let isInPasswordList: boolean = false;
    let userLastFivePassword: Password[] = [];

    const { username } = await this.findByUsername(currentUsername);
    try {
      userLastFivePassword = await this.passwordRepository.find({
        username,
      });
    } catch (e) {
      this.logger.error(e);
      throw new Error('The user could not be found due to a database error');
    }

    for (const entry of userLastFivePassword) {
      if (await this.compareHash(password, entry.passwordHash)) {
        isSame = true;
      }
    }

    if ((await this.checkIfOnlyFivePasswordsEntries(username)) && !isSame) {
      this.replaceOldPasswordsEntries(username, password, updatedAt);
    }

    if (isSame) {
      return (isInPasswordList = true);
    }

    return isInPasswordList;
  }

  private async savePassword(
    username: string,
    passwordHash: string,
    updatedAt: Date,
  ): Promise<Password> {
    try {
      if (!(await this.checkIfOnlyFivePasswordsEntries(username))) {
        return await this.passwordRepository.save({
          username,
          passwordHash,
          updatedAt,
        });
      }
    } catch (error) {
      this.logger.error(error);
      throw new Error(`Cannot Save data in database`);
    }
  }

  private async checkIfOnlyFivePasswordsEntries(
    username: string,
  ): Promise<boolean> {
    const passwordRecordLimit: number = 5;
    let userLastFivePassword: Password[];
    let haveFiveEntires: boolean = false;
    try {
      userLastFivePassword = await this.passwordRepository.find({
        username,
      });
    } catch (e) {
      this.logger.error(e);
      throw new Error('The user could not be found due to a database error');
    }
    if (userLastFivePassword.length === passwordRecordLimit) {
      haveFiveEntires = true;
    }

    return haveFiveEntires;
  }

  private async replaceOldPasswordsEntries(
    username: string,
    password: string,
    updatedAt: Date,
  ): Promise<UpdateResult> {
    let oldestPasswordEntity: Password[];

    try {
      oldestPasswordEntity = await this.passwordRepository.find({
        where: {
          username,
        },
        order: {
          updatedAt: 'ASC',
        },
        take: 1,
      });

      oldestPasswordEntity[0].passwordHash = await bcrypt.hash(
        password,
        this.SALT_ROUNDS,
      );
      oldestPasswordEntity[0].updatedAt = updatedAt;
    } catch (e) {
      this.logger.error(e);
      throw new Error('The user could not be found due to a database error');
    }

    try {
      return await this.passwordRepository.update(
        oldestPasswordEntity[0].id,
        oldestPasswordEntity[0],
      );
    } catch (error) {
      this.logger.error(error);
      throw new Error(`Cannot Save data in database`);
    }
  }
}
