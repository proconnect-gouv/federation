import { AuthenticationService } from './authentication.service';
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from 'nestjs-config';
import { AuthenticationFailures } from './authentication-failures.sql.entity';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/roles.enum';
import { AuthenticationStates } from './authentication-actions.enum';
import * as MockDate from 'mockdate';
import { LoggerService } from '@fc/shared/logger/logger.service';

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  const mockedUserService = {
    findByUsername: jest.fn(),
    compareHash: jest.fn(),
  };
  const authenticationRepositoryMock = {
    save: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };
  const configServiceMock = {
    get: jest.fn(),
  };

  const businessEventMock = jest.fn();
  const loggerMock = {
    businessEvent: businessEventMock,
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([AuthenticationFailures])],
      providers: [
        AuthenticationService,
        UserService,
        Repository,
        ConfigService,
        LoggerService,
      ],
    })
      .overrideProvider(getRepositoryToken(AuthenticationFailures))
      .useValue(authenticationRepositoryMock)
      .overrideProvider(UserService)
      .useValue(mockedUserService)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    jest.resetAllMocks();
  });

  describe('validateCredentials', () => {
    let user;
    let username;
    let password;
    beforeEach(() => {
      user = {
        passwordHash: Symbol('password hash'),
        token: Symbol('2ddeb850-ee40-43ed-903e-44a5dad759d8'),
        roles: [],
      };
      username = Symbol('username');
      password = Symbol('password');
      jest
        .spyOn(mockedUserService, 'findByUsername')
        .mockImplementation(candidate => {
          if (candidate === username) {
            return Promise.resolve(user);
          }
          return Promise.reject('User not found');
        });
      jest
        .spyOn(mockedUserService, 'compareHash')
        .mockReturnValue(Promise.resolve(true));
    });

    describe('validateCredentials login', () => {
      it('calls the UserService findByUsername', async () => {
        await authenticationService.validateCredentials(username, password);
        expect(mockedUserService.findByUsername).toHaveBeenCalledTimes(1);
        expect(mockedUserService.findByUsername).toHaveBeenCalledWith(username);
      });

      it('fails to validate the credentials if no user is found', async () => {
        return expect(
          authenticationService.validateCredentials('jeanmoust', password),
        ).rejects.toBeDefined();
      });

      it('fails to validate the user if the user is blocked', () => {
        jest.spyOn(mockedUserService, 'findByUsername').mockReturnValue(
          Promise.resolve({
            id: '123456',
            username,
            roles: ['blocked_user'],
          }),
        );
        return expect(
          authenticationService.validateCredentials(username, password),
        ).resolves.toBe(null);
      });

      it('fails to validate if a regular user try to connect on first login route', async () => {
        jest.spyOn(mockedUserService, 'findByUsername').mockReturnValue(
          Promise.resolve({
            id: '123456',
            username,
            roles: ['operator'],
          }),
        );
        const token = 'MyGreatToken';
        return expect(
          authenticationService.validateCredentials(username, password, token),
        ).resolves.toBe(null);
      });

      it('calls the UserService compareHash', async () => {
        await authenticationService.validateCredentials(username, password);
        expect(mockedUserService.compareHash).toHaveBeenCalledTimes(1);
        expect(mockedUserService.compareHash).toHaveBeenCalledWith(
          password,
          user.passwordHash,
        );
      });

      it('returns an error if the credentials are invalid', async () => {
        jest
          .spyOn(mockedUserService, 'compareHash')
          .mockReturnValue(Promise.resolve(false));
        return expect(
          authenticationService.validateCredentials(username, password),
        ).resolves.toBe(null);
      });

      it('returns the user if the credentials are valid', async () => {
        const actualUser = await authenticationService.validateCredentials(
          username,
          password,
        );
        expect(actualUser).toBe(user);
      });
    });

    describe('validateCredentials first-login', () => {
      beforeEach(() => {
        // setup
        user.roles = [UserRole.NEWUSER];
      });

      it('returns the user if the activation token and the credentials are valid', async () => {
        // action
        const actualUser = await authenticationService.validateCredentials(
          username,
          password,
          user.token,
        );

        // assert
        expect(actualUser).toBe(user);
      });

      it('returns null if the user is not found', async () => {
        jest
          .spyOn(mockedUserService, 'findByUsername')
          .mockReturnValue(Promise.reject(null));
        return expect(
          authenticationService.validateCredentials(username, password),
        ).rejects.toBe(null);
      });

      it('returns null if the user is blocked', async () => {
        jest.spyOn(mockedUserService, 'findByUsername').mockReturnValue(
          Promise.resolve({
            id: '123456',
            username,
            roles: ['new_account', 'blocked_user'],
            token: 'myToken',
          }),
        );
        return expect(
          authenticationService.validateCredentials(username, password),
        ).resolves.toBe(null);
      });

      it('returns "null" if the activation token is not valid', async () => {
        // action
        const actualUser = await authenticationService.validateCredentials(
          username,
          password,
          'Not the token',
        );

        // assert
        expect(actualUser).toBeNull();
      });

      it('returns "null" if the activation token is valid but the credentials are invalid', async () => {
        // setup
        jest
          .spyOn(mockedUserService, 'compareHash')
          .mockReturnValue(Promise.resolve(false));

        // action
        const actualUser = await authenticationService.validateCredentials(
          username,
          'nop',
          user.token,
        );

        // assert
        expect(actualUser).toBeNull();
      });
    });
  });

  describe('getAuthenticationFailureReason', () => {
    it('should return DENIED_USER_NOT_FOUND if the user could not be found in database', async () => {
      // setup
      mockedUserService.findByUsername.mockResolvedValueOnce(undefined);
      // action
      const result = await authenticationService.getAuthenticationFailureReason(
        'user',
        'password',
        'MyToken',
      );

      // assertion
      expect(result).toEqual(AuthenticationStates.DENIED_USER_NOT_FOUND);
    });

    it('should return DENIED_BLOCKED_USER if the user found is blocked', async () => {
      // setup
      mockedUserService.findByUsername.mockResolvedValueOnce({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'user',
        roles: ['blocked_user'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
      });

      // action
      const result = await authenticationService.getAuthenticationFailureReason(
        'user',
        'password',
      );

      // assertion
      expect(result).toEqual(AuthenticationStates.DENIED_BLOCKED_USER);
    });

    it('should return DENIED_NOT_A_NEW_USER if a regular user tries to login through first login route', async () => {
      // setup
      mockedUserService.findByUsername.mockResolvedValueOnce({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'user',
        roles: ['operator'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
      });

      // action
      const result = await authenticationService.getAuthenticationFailureReason(
        'user',
        'password',
        'token',
      );

      // assertion
      expect(result).toEqual(AuthenticationStates.DENIED_NOT_A_NEW_USER);
    });

    it('should return DENIED_MAX_AUTHENTICATION_ATTEMPTS_REACHED if isMaxAuthenticationAttemptLimitReached returns true', async () => {
      // setup
      mockedUserService.findByUsername.mockResolvedValueOnce({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'user',
        roles: ['operator'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
      });
      const mockDateExpire = new Date();
      mockDateExpire.setFullYear(mockDateExpire.getFullYear() + 1);
      authenticationRepositoryMock.findAndCount.mockResolvedValueOnce([
        [
          {
            id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: mockDateExpire,
          },
          {
            id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: mockDateExpire,
          },
          {
            id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: mockDateExpire,
          },
          {
            id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: mockDateExpire,
          },
          {
            id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: mockDateExpire,
          },
          {
            id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: mockDateExpire,
          },
        ],
        6,
      ]);
      const userAuthenticationMaxAttempt = 5;
      configServiceMock.get.mockReturnValue(userAuthenticationMaxAttempt);
      // action
      const result = await authenticationService.getAuthenticationFailureReason(
        'user',
        'password',
      );
      // assertion
      expect(result).toEqual(
        AuthenticationStates.DENIED_MAX_AUTHENTICATION_ATTEMPTS_REACHED,
      );
    });

    it("should return DENIED_NEW_USER_TOKEN_EXPIRED if the new user's token has expired", async () => {
      // setup
      const mockDateExpire = new Date();
      mockDateExpire.setFullYear(mockDateExpire.getFullYear() - 1);
      mockedUserService.findByUsername.mockResolvedValueOnce({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'user',
        roles: ['new_account'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
        token: 'MyToken',
        tokenExpiresAt: mockDateExpire,
      });
      authenticationRepositoryMock.findAndCount.mockResolvedValueOnce([
        [
          {
            id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: mockDateExpire,
          },
        ],
        1,
      ]);
      const userAuthenticationMaxAttempt = 5;
      configServiceMock.get.mockReturnValue(userAuthenticationMaxAttempt);

      // action
      const result = await authenticationService.getAuthenticationFailureReason(
        'user',
        'password',
        'MyToken',
      );

      expect(result).toEqual(
        AuthenticationStates.DENIED_NEW_USER_TOKEN_EXPIRED,
      );
    });

    it('should return DENIED_PASSWORD_AND_TOKEN if password and token are invalid', async () => {
      // setup
      const mockDateExpire = new Date();
      mockDateExpire.setFullYear(mockDateExpire.getFullYear() + 1);
      mockedUserService.findByUsername.mockResolvedValueOnce({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'user',
        roles: ['new_account'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
        token: 'MyToken',
        tokenExpiresAt: mockDateExpire,
      });
      authenticationRepositoryMock.findAndCount.mockResolvedValueOnce([
        [
          {
            id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: mockDateExpire,
          },
        ],
        1,
      ]);
      const userAuthenticationMaxAttempt = 5;
      configServiceMock.get.mockReturnValue(userAuthenticationMaxAttempt);
      mockedUserService.compareHash.mockResolvedValueOnce(false);

      // action
      const result = await authenticationService.getAuthenticationFailureReason(
        'user',
        'password',
        'MyTokenDoesNotMatchUserToken',
      );

      expect(result).toEqual(
        AuthenticationStates.DENIED_PASSWORD_AND_TOKEN_INVALIDS,
      );
    });

    it('should return DENIED_TOKEN if only token is invalid', async () => {
      // setup
      const mockDateExpire = new Date();
      mockDateExpire.setFullYear(mockDateExpire.getFullYear() + 1);
      mockedUserService.findByUsername.mockResolvedValueOnce({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'user',
        roles: ['new_account'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
        token: 'MyToken',
        tokenExpiresAt: mockDateExpire,
      });
      authenticationRepositoryMock.findAndCount.mockResolvedValueOnce([
        [
          {
            id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: mockDateExpire,
          },
        ],
        1,
      ]);
      const userAuthenticationMaxAttempt = 5;
      configServiceMock.get.mockReturnValue(userAuthenticationMaxAttempt);
      mockedUserService.compareHash.mockResolvedValueOnce(true);

      // action
      const result = await authenticationService.getAuthenticationFailureReason(
        'user',
        'password',
        'MyTokenDoesNotMatchUserToken',
      );

      expect(result).toEqual(AuthenticationStates.DENIED_TOKEN_INVALID);
    });

    it('should return DENIED_PASSWORD if only password is invalid', async () => {
      // setup
      const mockDateExpire = new Date();
      mockDateExpire.setFullYear(mockDateExpire.getFullYear() + 1);
      mockedUserService.findByUsername.mockResolvedValueOnce({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'user',
        roles: ['new_account'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
        token: 'MyToken',
        tokenExpiresAt: mockDateExpire,
      });
      authenticationRepositoryMock.findAndCount.mockResolvedValueOnce([
        [
          {
            id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: mockDateExpire,
          },
        ],
        1,
      ]);
      const userAuthenticationMaxAttempt = 5;
      configServiceMock.get.mockReturnValue(userAuthenticationMaxAttempt);
      mockedUserService.compareHash.mockResolvedValueOnce(false);

      // action
      const result = await authenticationService.getAuthenticationFailureReason(
        'user',
        'password',
        'MyToken',
      );

      expect(result).toEqual(AuthenticationStates.DENIED_PASSWORD_INVALID);
    });
  });

  describe('saveUserAuthenticationFailure', () => {
    it('should return an authentication entity', async () => {
      // setup
      const username = 'user';
      const token = 'myToken';
      authenticationRepositoryMock.save.mockResolvedValueOnce({
        id: '123456',
        username: 'user',
        token: 'myToken',
        authenticationAttemptedAt: '2020-03-03T16:36:56.135Z',
      });

      // action
      const result = await authenticationService.saveUserAuthenticationFailure(
        username,
        token,
      );

      // assertion
      expect(authenticationRepositoryMock.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: '123456',
        username: 'user',
        token: 'myToken',
        authenticationAttemptedAt: '2020-03-03T16:36:56.135Z',
      });
    });

    it('should return an authentication entity, function being called without token', async () => {
      // setup
      const username = 'user';
      authenticationRepositoryMock.save.mockResolvedValueOnce({
        id: '123456',
        username: 'user',
        token: '',
        authenticationAttemptedAt: '2020-03-03T16:36:56.135Z',
      });
      // action
      const result = await authenticationService.saveUserAuthenticationFailure(
        username,
        undefined,
      );

      // assertion
      expect(authenticationRepositoryMock.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: '123456',
        username: 'user',
        token: '',
        authenticationAttemptedAt: '2020-03-03T16:36:56.135Z',
      });
    });

    it('should fall back in catch statement if the database could not be reached', async () => {
      // setup
      const username = 'user';
      const token = 'Mytoken';
      authenticationRepositoryMock.save.mockRejectedValueOnce(undefined);
      // action
      try {
        const result = await authenticationService.saveUserAuthenticationFailure(
          username,
          token,
        );
      } catch (e) {
        const { message } = e;
        expect(e).toBeInstanceOf(Error);
        expect(message).toEqual(
          'The authentication attempt could not be saved due to a database error',
        );
        expect(loggerMock.error).toHaveBeenCalled();
      }

      // assertion
      expect.hasAssertions();
    });
  });

  describe('deleteUserAuthenticationFailures', () => {
    it('should delete user entries of the given user', async () => {
      // setup
      const username = 'user';
      const userToDelete = [
        {
          id: 1,
          username: 'user',
          token: '123456',
          authenticationAttemptedAt: '2020-04-16T15:25:24.985Z',
        },
        {
          id: 1,
          username: 'user',
          token: '123456',
          authenticationAttemptedAt: '2020-04-16T15:25:26.985Z',
        },
      ];
      authenticationRepositoryMock.delete.mockResolvedValueOnce(userToDelete);
      const expectedResult = userToDelete;

      // action
      const result = await authenticationService.deleteUserAuthenticationFailures(
        username,
      );

      // assertion
      expect(authenticationRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(authenticationRepositoryMock.delete).toHaveBeenCalledWith({
        username,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should fall back in catch statement if the user entries could not be deleted due to a database error', async () => {
      // setup
      const username = 'user';
      authenticationRepositoryMock.delete.mockRejectedValueOnce(undefined);

      // action
      try {
        await authenticationService.deleteUserAuthenticationFailures(username);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        const { message } = e;
        expect(message).toEqual(
          'The authentication attempts could not be deleted',
        );
        expect(loggerMock.error).toHaveBeenCalled();
      }

      // assertion
      expect.hasAssertions();
    });
  });

  describe('getAuthenticationAttemptCount', () => {
    it('should return the number of times a user tried to log in', async () => {
      // setup
      const username = 'user';
      authenticationRepositoryMock.findAndCount.mockReturnValueOnce([
        [
          {
            id: '123456',
            username: 'user',
            token: 'myToken',
            authenticationAttemptedAt: '2020-03-03T16:36:56.135Z',
          },
          {
            id: '123456',
            username: 'user',
            token: 'myToken',
            authenticationAttemptedAt: '2020-04-03T16:36:56.135Z',
          },
          {
            id: '123456',
            username: 'user',
            token: 'myToken',
            authenticationAttemptedAt: '2020-05-03T16:36:56.135Z',
          },
        ],
        3,
      ]);

      // action
      const result = await authenticationService.getAuthenticationAttemptCount(
        username,
      );

      // assertion
      expect(result).toEqual(3);
    });

    it('should fall back in catch statement if the database could not be reached', async () => {
      // setup
      const username = 'user';
      authenticationRepositoryMock.findAndCount.mockRejectedValueOnce(
        undefined,
      );

      // action
      try {
        const result = await authenticationService.getAuthenticationAttemptCount(
          username,
        );
      } catch (e) {
        const { message } = e;
        expect(e).toBeInstanceOf(Error);
        expect(message).toEqual(
          'The authentication attempts count could not be retrieved due to a database error',
        );
        expect(loggerMock.error).toHaveBeenCalled();
      }

      // assertion
      expect.hasAssertions();
    });
  });

  describe('isMaxAuthenticationAttemptLimitReached', () => {
    it('should return false if authentication limit attempt is not reached', async () => {
      // setup
      authenticationRepositoryMock.findAndCount.mockResolvedValueOnce(1);
      const userAuthenticationMaxAttempt = 5;
      configServiceMock.get.mockReturnValue(userAuthenticationMaxAttempt);
      // action
      const result = await authenticationService[
        // tslint:disable-next-line no-string-literal
        'isMaxAuthenticationAttemptLimitReached'
      ]('user');

      // assertion
      expect(result).toEqual(false);
    });

    it('should return true if authentication limit attempt is reached', async () => {
      // setup
      const mockDate = new Date();
      mockDate.setFullYear(mockDate.getFullYear() + 1);
      authenticationRepositoryMock.findAndCount.mockResolvedValueOnce([
        [
          {
            id: '123456',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: MockDate,
          },
          {
            id: '123456',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: MockDate,
          },
          {
            id: '123456',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: MockDate,
          },
          {
            id: '123456',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: MockDate,
          },
          {
            id: '123456',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: MockDate,
          },
        ],
        5,
      ]);
      const userAuthenticationMaxAttempt = 5;
      configServiceMock.get.mockReturnValue(userAuthenticationMaxAttempt);
      // action
      const result = await authenticationService[
        // tslint:disable-next-line no-string-literal
        'isMaxAuthenticationAttemptLimitReached'
      ]('user');

      // assertion
      expect(result).toEqual(true);
    });

    it('should return true if authentication limit attempt is exceeded ', async () => {
      // setup
      const mockDate = new Date();
      mockDate.setFullYear(mockDate.getFullYear() + 1);
      authenticationRepositoryMock.findAndCount.mockResolvedValueOnce([
        [
          {
            id: '123456',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: MockDate,
          },
          {
            id: '123456',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: MockDate,
          },
          {
            id: '123456',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: MockDate,
          },
          {
            id: '123456',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: MockDate,
          },
          {
            id: '123456',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: MockDate,
          },
          {
            id: '123456',
            username: 'user',
            token: 'MyToken',
            authenticationAttemptedAt: MockDate,
          },
        ],
        6,
      ]);
      const userAuthenticationMaxAttempt = 5;
      configServiceMock.get.mockReturnValue(userAuthenticationMaxAttempt);
      // action
      const result = await authenticationService[
        // tslint:disable-next-line no-string-literal
        'isMaxAuthenticationAttemptLimitReached'
      ]('user');

      // assertion
      expect(result).toEqual(true);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false if the token is not expired', async () => {
      // setup
      const mockDateExpire = new Date();
      mockDateExpire.setFullYear(mockDateExpire.getFullYear() + 1);

      // action
      const result = await authenticationService[
        // tslint:disable-next-line no-string-literal
        'isTokenExpired'
      ](mockDateExpire);

      // assertion
      expect(result).toEqual(false);
    });

    it('should return true if the token is expired', async () => {
      // setup
      const mockDateExpire = new Date();
      mockDateExpire.setFullYear(mockDateExpire.getFullYear() - 1);

      // action
      const result = await authenticationService[
        // tslint:disable-next-line no-string-literal
        'isTokenExpired'
      ](mockDateExpire);

      // assertion
      expect(result).toEqual(true);
    });
  });

  describe('getUserSecret', () => {
    let user;
    let username;
    let password;
    beforeEach(() => {
      user = {
        passwordHash: Symbol('password hash'),
        token: Symbol('2ddeb850-ee40-43ed-903e-44a5dad759d8'),
        roles: [],
      };
      username = Symbol('username');
      password = Symbol('password');
      jest
        .spyOn(mockedUserService, 'findByUsername')
        .mockImplementation(candidate => {
          if (candidate === username) {
            return Promise.resolve(user);
          }
          return Promise.reject('User not found');
        });
    });

    it('calls the UserService findByUsername', async () => {
      await authenticationService.getUserSecret(username);
      expect(mockedUserService.findByUsername).toHaveBeenCalledTimes(1);
      expect(mockedUserService.findByUsername).toHaveBeenCalledWith(username);
    });

    it('calls the UserService findByUsername and failed', async () => {
      return expect(
        authenticationService.validateCredentials('jeanmoust', password),
      ).rejects.toBeDefined();
    });
  });
});
