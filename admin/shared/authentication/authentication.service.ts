import { InjectConfig, ConfigService } from 'nestjs-config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { User } from '../user/user.sql.entity';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/roles.enum';

import { AuthenticationFailures } from './authentication-failures.sql.entity';
import { AuthenticationStates } from './authentication-actions.enum';

import { LoggerService } from '@fc/shared/logger/logger.service';

// the "token" parameter is used for the first connection
export interface IAuthenticationService {
  validateCredentials(
    usernameInput: string,
    passwordInput: string,
    token?: string,
  ): Promise<User | null>;
  getAuthenticationFailureReason(
    usernameInput: string,
    passwordInput: string,
    token?: string,
  ): Promise<AuthenticationStates>;
  getAuthenticationAttemptCount(usernameInput: string): Promise<number>;
  saveUserAuthenticationFailure(
    usernameInput: string,
    token: string,
  ): Promise<AuthenticationFailures>;
  getUserSecret(username: string): Promise<string>;
  deleteUserAuthenticationFailures(username: string): Promise<DeleteResult>;
  isMaxAuthenticationAttemptLimitReached(
    usernameInput: string,
  ): Promise<boolean>;
}

@Injectable()
export class AuthenticationService implements IAuthenticationService {
  constructor(
    @InjectRepository(AuthenticationFailures)
    private readonly authenticationFailuresRepository: Repository<
      AuthenticationFailures
    >,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
    @InjectConfig() private readonly config: ConfigService,
  ) {}

  async validateCredentials(
    usernameInput: string,
    passwordInput: string,
    token?: string,
  ): Promise<User | null> {
    const user = await this.userService.findByUsername(usernameInput);

    if (!user) {
      return null;
    }

    if (user.roles.includes(UserRole.BLOCKED_USER)) {
      return null;
    }

    if (token && !user.roles.includes(UserRole.NEWUSER)) {
      return null;
    }

    if (user.roles.includes(UserRole.NEWUSER) && token !== user.token) {
      return null;
    }

    const passwordMatches = await this.userService.compareHash(
      passwordInput,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return null;
    }

    return user;
  }

  async getAuthenticationFailureReason(
    usernameInput: string,
    passwordInput: string,
    token?: string,
  ): Promise<AuthenticationStates> {
    const user = await this.userService.findByUsername(usernameInput);
    const userExists = Boolean(user);

    if (!userExists) {
      return AuthenticationStates.DENIED_USER_NOT_FOUND;
    }

    if (user.roles.includes(UserRole.BLOCKED_USER)) {
      return AuthenticationStates.DENIED_BLOCKED_USER;
    }

    if (token && !user.roles.includes(UserRole.NEWUSER)) {
      return AuthenticationStates.DENIED_NOT_A_NEW_USER;
    }

    const maxAuthenticationAttemptLimitReached = await this.isMaxAuthenticationAttemptLimitReached(
      usernameInput,
    );

    if (maxAuthenticationAttemptLimitReached) {
      return AuthenticationStates.DENIED_MAX_AUTHENTICATION_ATTEMPTS_REACHED;
    }

    const firstConnexion =
      token && user && user.roles.includes(UserRole.NEWUSER);

    if (firstConnexion) {
      if (token === user.token) {
        const tokenExpired = this.isTokenExpired(user.tokenExpiresAt);
        if (tokenExpired) {
          return AuthenticationStates.DENIED_NEW_USER_TOKEN_EXPIRED;
        }
      }
    }

    const passwordMatchUser = await this.userService.compareHash(
      passwordInput,
      user.passwordHash,
    );

    const tokenMatchUser = token === user.token;

    if (firstConnexion && !tokenMatchUser && !passwordMatchUser) {
      return AuthenticationStates.DENIED_PASSWORD_AND_TOKEN_INVALIDS;
    }

    if (firstConnexion && !tokenMatchUser) {
      return AuthenticationStates.DENIED_TOKEN_INVALID;
    }

    return AuthenticationStates.DENIED_PASSWORD_INVALID;
  }

  async saveUserAuthenticationFailure(
    usernameInput: string,
    token: string,
  ): Promise<AuthenticationFailures> {
    try {
      const authenticationAttemptedAt = new Date();
      const savedAttempt = await this.authenticationFailuresRepository.save({
        username: usernameInput,
        token,
        authenticationAttemptedAt,
      });
      return savedAttempt;
    } catch (e) {
      this.logger.error(e);
      throw new Error(
        'The authentication attempt could not be saved due to a database error',
      );
    }
  }

  async deleteUserAuthenticationFailures(
    username: string,
  ): Promise<DeleteResult> {
    try {
      const removeUserEntries = await this.authenticationFailuresRepository.delete(
        { username },
      );

      return removeUserEntries;
    } catch (e) {
      this.logger.error(e);
      throw new Error('The authentication attempts could not be deleted');
    }
  }

  private isTokenExpired(tokenExpiresAt: Date): boolean {
    // it handles token expiration
    const date = new Date();

    if (tokenExpiresAt.getTime() - date.getTime() < 0) {
      return true;
    }

    return false;
  }

  async isMaxAuthenticationAttemptLimitReached(
    usernameInput: string,
  ): Promise<boolean> {
    const authenticationAttemptLimitReached = await this.getAuthenticationAttemptCount(
      usernameInput,
    );

    const userAuthenticationMaxAttempt = this.config.get(
      'app.userAuthenticationMaxAttempt',
    );
    if (authenticationAttemptLimitReached >= userAuthenticationMaxAttempt) {
      return true;
    }

    return false;
  }

  async getAuthenticationAttemptCount(username: string): Promise<number> {
    try {
      const numberOfAttemptsAndEntities = await this.authenticationFailuresRepository.findAndCount(
        {
          username,
        },
      );
      const attempts = numberOfAttemptsAndEntities[1];
      return attempts;
    } catch (e) {
      this.logger.error(e);
      throw new Error(
        'The authentication attempts count could not be retrieved due to a database error',
      );
    }
  }

  async getUserSecret(username: string): Promise<string | null> {
    const user = await this.userService.findByUsername(username);

    if (user) {
      return user.secret;
    }

    return null;
  }
}
