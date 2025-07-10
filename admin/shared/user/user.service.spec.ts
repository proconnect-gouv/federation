import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.sql.entity';
import { Password } from './password.sql.entity';
import { UserService } from './user.service';
import { UserRole } from './roles.enum';
import { IUserPasswordUpdateDTO } from './interface/user-password-update-dto.interface';
import { ICreateUserDTO } from './interface/create-user-dto.interface';
import { IsPasswordCompliant } from '../account/validator/is-compliant.validator';
import { ConfigService } from 'nestjs-config';
import { MailerService } from '../mailer/mailer.service';
import { MailerModule } from '../mailer/mailer.module';
import * as uuid from 'uuid';
import { LoggerService } from '@fc/shared/logger/logger.service';

const mockValidate = jest.fn();
IsPasswordCompliant.prototype.validate = mockValidate;

describe('UserService', () => {
  let userService: UserService;
  const userRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const generatePasswordMock = {
    generate: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const businessEventMock = jest.fn();
  const loggerMock = {
    businessEvent: businessEventMock,
    error: jest.fn(),
  };

  const transporterMock = {
    send: jest.fn(),
  };

  const generatePasswordProvider = {
    provide: 'generatePassword',
    useValue: generatePasswordMock,
  };

  const user = {
    id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
    username: 'fred',
    roles: [
      'new_account',
      'inactive_admin',
      'inactive_operator',
      'inactive_security',
    ],
    email: 'foo@bar.com',
    passwordHash:
      // correspond à ce password : 'MyPass20!!'
      '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
  };

  const mockToken = '3a95ebfa-cd28-40f1-ab6e-5eb4cef352e3';
  const userTokenExpiresIn = 2880;

  const passwordRepositoryMock = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const authorMock = 'authorMockValue';

  beforeEach(async () => {
    configServiceMock.get.mockReturnValue({
      userTokenExpiresIn,
    });

    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([User, Password]),
        MailerModule.forRoot({
          transport: 'log',
          emailOptions: {
            from: {
              name: 'batou',
              email: 'batou@gotham.bt',
            },
            smtpSenderName: 'someName',
            smtpSenderEmail: 'someEmail',
          },
        }),
      ],
      providers: [
        UserService,
        generatePasswordProvider,
        Repository,
        ConfigService,
        MailerService,
        LoggerService,
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepositoryMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(MailerService)
      .useValue(transporterMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(getRepositoryToken(Password))
      .useValue(passwordRepositoryMock)
      .compile();

    userService = await module.get<UserService>(UserService);

    jest.resetAllMocks();
    jest.clearAllMocks();
    jest.restoreAllMocks();

    jest.spyOn(uuid, 'v4').mockReturnValueOnce(mockToken);
  });

  describe('callGeneratePassword', () => {
    it('should be called with the wright arguments', () => {
      // setup

      const args = {
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
        strict: true,
      };

      // action
      userService.callGeneratePassword();
      // assertion
      expect(generatePasswordMock.generate).toHaveBeenCalledWith(args);
    });
  });

  describe('generateTmpPass', () => {
    it('should return a temporary password', () => {
      // Set up
      mockValidate.mockReturnValue(true);
      userService.callGeneratePassword = jest
        .fn()
        .mockReturnValue('GoodToGo10!!');

      // action
      const result = userService.generateTmpPass();

      // assertion
      expect(result).toEqual('GoodToGo10!!');
    });

    it('should return an error message', () => {
      // Set up
      mockValidate.mockReturnValue(false);
      userService.callGeneratePassword = jest
        .fn()
        .mockReturnValue('GoodToGo10!!');

      // action
      const result = userService.generateTmpPass();

      // assertion
      expect(result).toEqual(
        'The password could not be generated, please try again',
      );
    });
  });

  describe('enrollUser', () => {
    it('should call updatePassword', async () => {
      // setup
      const enrollmentPassword = {
        password: 'MyPass10!!',
        passwordConfirmation: 'MyPass10!!',
      };
      userService.updatePassword = jest.fn().mockReturnValueOnce({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'fred',
        roles: [
          'new_account',
          'inactive_admin',
          'inactive_operator',
          'inactive_security',
        ],
      });
      const expectedRoles = ['admin', 'operator', 'security'];

      // action
      const result = await userService.enrollUser(user, enrollmentPassword);

      // assertion
      expect(userService.updatePassword).toHaveBeenCalledTimes(1);
      expect(userService.updatePassword).toHaveBeenCalledWith(
        user,
        enrollmentPassword.password,
        { roles: expectedRoles },
      );
      expect(result).toBeInstanceOf(Object);
    });

    it('should fall back in else statement', async () => {
      // setup
      const enrollmentPassword = {
        password: 'MyPass10!!',
        passwordConfirmation: 'MyPass10!!',
      };
      userService.updatePassword = jest.fn().mockRejectedValue('false');

      // action
      try {
        await userService.enrollUser(user, enrollmentPassword);
      } catch (err) {
        const message = err.message;

        // assertion
        expect(userService.updatePassword).toHaveBeenCalledTimes(1);
        expect(message).toBeTruthy();
      }
      expect.hasAssertions();
    });

    it('should call track()', async () => {
      // setup
      const enrollmentPassword = {
        password: 'MyPass10!!',
        passwordConfirmation: 'MyPass10!!',
      };
      userService.updatePassword = jest.fn().mockReturnValueOnce({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'fred',
        roles: [
          'new_account',
          'inactive_admin',
          'inactive_operator',
          'inactive_security',
        ],
        email: 'foo@bar.com',
      });
      const expectedRoles = ['admin', 'operator', 'security'];
      // tslint:disable-next-line:no-string-literal
      userService['track'] = jest.fn();

      // action
      const result = await userService.enrollUser(user, enrollmentPassword);

      // assertion
      // tslint:disable-next-line:no-string-literal
      expect(userService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(userService['track']).toHaveBeenCalledWith({
        action: 'enroll',
        user: 'fred',
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        name: user.email,
      });
    });
  });

  describe('compareHash', () => {
    it('resolves true if the hashes match', async () => {
      const password = 'georgesmoustaki';
      const hash =
        '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e';

      return expect(userService.compareHash(password, hash)).resolves.toBe(
        true,
      );
    });

    it("resolves false if the hashes don't match", async () => {
      const password = 'georgesmoustaki';
      const hash = 'la barbe de sa femme';

      return expect(userService.compareHash(password, hash)).resolves.toBe(
        false,
      );
    });
  });

  describe('findByUsername', () => {
    it('calls the repository', async () => {
      userRepositoryMock.findOne.mockImplementation(() =>
        Promise.resolve({
          email: 'toto@toto.com',
          roles: ['admin'],
          passwordHash: 'MyPass',
          secret: 'MySecret',
        }),
      );
      const foundUser = await userService.findByUsername('jean_moust');

      expect(userRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        username: 'jean_moust',
      });
      expect(foundUser).toHaveProperty('email');
      expect(foundUser).toHaveProperty('roles');
      expect(foundUser).toHaveProperty('passwordHash');
      expect(foundUser).toHaveProperty('secret');
    });

    it('fails when the user is not found', async () => {
      userRepositoryMock.findOne.mockRejectedValue('User not found');

      return expect(
        userService.findByUsername('michael jackson'),
      ).rejects.toBeDefined();
    });

    it('should fall back in catch statement if the database could not be reached', async () => {
      // setup
      const username = 'toto';
      userRepositoryMock.findOne.mockRejectedValueOnce('user not found');

      // action
      try {
        const result = await userService.findByUsername(username);
      } catch (e) {
        const { message } = e;
        expect(e).toBeInstanceOf(Error);
        expect(message).toEqual(
          'The user could not be found due to a database error',
        );
        // expect(loggerMock.error).toHaveBeenCalledWith(e);
        expect(loggerMock.error).toHaveBeenCalled();
      }

      // assertion
      expect.hasAssertions();
    });
  });

  describe('createUser', () => {
    beforeEach(() => {
      // need to mock the private mthod
      // tslint:disable-next-line: no-string-literal
      userService['savePassword'] = jest.fn();
    });

    it('creates the user', async () => {
      // setup
      const userMock: ICreateUserDTO = {
        username: 'jean_moust',
        email: 'jean@moust.lol',
        password: 'georgesmoustaki',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SECURITY],
        secret: '1234',
      };

      configServiceMock.get.mockReturnValueOnce({
        app_root: '/foo/bar',
        appName: 'Exploitation',
        smtpSenderName: 'someString',
        smtpSenderEmail: 'someString',
      });

      // Private method testing https://stackoverflow.com/a/35991491/1071169
      userService[
        // tslint:disable-next-line no-string-literal
        'setAuthenticationTokenExpirationDate'
      ] = jest.fn().mockReturnValue({
        tokenCreatedAt: '2020-03-03T16:36:56.135Z',
        tokenExpiresAt: '2020-03-05T16:36:56.135Z',
      });

      userService.sendNewAccountEmail = jest.fn().mockReturnValueOnce({});

      // action
      await userService.createUser(userMock, authorMock);

      // expect
      expect(userRepositoryMock.save).toHaveBeenCalledTimes(1);
      const { passwordHash } = userRepositoryMock.save.mock.calls[0][0];
      expect(bcrypt.compare(userMock.password, passwordHash)).toBeTruthy();
      expect(userRepositoryMock.save).toHaveBeenCalledWith({
        email: 'jean@moust.lol',
        passwordHash,
        roles: ['admin', 'operator', 'security'],
        secret: '1234',
        token: mockToken,
        tokenCreatedAt: '2020-03-03T16:36:56.135Z',
        tokenExpiresAt: '2020-03-05T16:36:56.135Z',
        username: 'jean_moust',
      });
    });

    it('call track()', async () => {
      // setup
      const userMock: ICreateUserDTO = {
        username: 'jean_moust',
        email: 'jean@moust.lol',
        password: 'georgesmoustaki',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SECURITY],
        secret: '1234',
      };

      configServiceMock.get.mockReturnValueOnce({
        app_root: '/foo/bar',
        appName: 'Exploitation',
        smtpSenderName: 'someString',
        smtpSenderEmail: 'someString',
      });

      // Private method testing https://stackoverflow.com/a/35991491/1071169
      userService[
        // tslint:disable-next-line no-string-literal
        'setAuthenticationTokenExpirationDate'
      ] = jest.fn().mockReturnValue({
        tokenCreatedAt: '2020-03-03T16:36:56.135Z',
        tokenExpiresAt: '2020-03-05T16:36:56.135Z',
      });

      userService.sendNewAccountEmail = jest.fn().mockReturnValueOnce({});
      // tslint:disable-next-line:no-string-literal
      userService['track'] = jest.fn();

      // action
      await userService.createUser(userMock, authorMock);

      // expect
      // tslint:disable-next-line:no-string-literal
      expect(userService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(userService['track']).toHaveBeenCalledWith({
        action: 'create',
        user: authorMock,
        name: userMock.email,
      });
    });

    it('does not create the user because of a database failure', async () => {
      const userMock: ICreateUserDTO = {
        username: 'jean_moust',
        email: 'jean@moust.lol',
        password: 'georgesmoustaki',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SECURITY],
        secret: '1234',
      };

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(() => Promise.resolve('toto'));
      userRepositoryMock.save = jest
        .fn()
        .mockRejectedValueOnce(new Error('The user could not be saved'));

      configServiceMock.get.mockReturnValueOnce({
        app_root: '/foo/bar',
        appName: 'Exploitation',
        smtpSenderName: 'someString',
        smtpSenderEmail: 'someString',
      });

      userService.sendNewAccountEmail = jest.fn().mockReturnValueOnce({});
      try {
        await userService.createUser(userMock, authorMock);
      } catch (err) {
        const { message } = err;
        expect(message).toEqual('The user could not be saved');
      }
      expect.hasAssertions();
    });

    it('does not create the user because of a bcrypt failure', async () => {
      const userMock: ICreateUserDTO = {
        username: 'jean_moust',
        email: 'jean@moust.lol',
        password: 'georgesmoustaki',
        roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SECURITY],
        secret: '1234',
      };
      jest
        .spyOn(bcrypt, 'hash')
        .mockRejectedValueOnce(
          new Error('password hash could not be generated'),
        );
      configServiceMock.get.mockReturnValueOnce({
        app_root: '/foo/bar',
      });
      try {
        await userService.createUser(userMock, authorMock);
      } catch (err) {
        const { message } = err;
        expect(message).toEqual('password hash could not be generated');
      }
      expect.hasAssertions();
    });
  });

  describe('setAuthenticationTokenExpirationDate', () => {
    it('should return an object with two objects of type date', () => {
      // action
      // tslint:disable-next-line no-string-literal
      const result = userService['setAuthenticationTokenExpirationDate']();
      // assert
      expect(result.tokenCreatedAt).toBeInstanceOf(Date);
      expect(result.tokenExpiresAt).toBeInstanceOf(Date);
    });

    it('should return an object with two objects of type date', () => {
      // action
      // tslint:disable-next-line no-string-literal
      const result = userService['setAuthenticationTokenExpirationDate']();
      // assert
      expect(Object.keys(result)).toMatchObject([
        'tokenCreatedAt',
        'tokenExpiresAt',
      ]);
    });

    it('should set "tokenExpiresAt" to "userTokenExpiresIn" minutes after "tokenCreatedAt"', () => {
      // action
      // tslint:disable-next-line no-string-literal
      const result = userService['setAuthenticationTokenExpirationDate']();
      // assert
      expect(
        result.tokenExpiresAt.getTime() - result.tokenCreatedAt.getTime(),
      ).toBe(userTokenExpiresIn * 60 * 1000);
    });
  });

  describe('blockUser', () => {
    const mockedUserUpdateResponse = {
      id: 'foo',
    };
    beforeEach(() => {
      userRepositoryMock.update.mockResolvedValue(mockedUserUpdateResponse);
      userRepositoryMock.findOne.mockResolvedValue({
        email: 'toto@toto.com',
        roles: ['admin'],
        passwordHash: 'MyPass',
        secret: 'MySecret',
        id: 'some-id',
      });
    });
    it('should block a user', async () => {
      // setup
      const username = 'user';

      // action
      const result = await userService.blockUser(username);
      // assertion
      expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.update).toHaveBeenCalledWith(
        { username },
        { roles: [UserRole.BLOCKED_USER] },
      );
    });

    it('call track()', async () => {
      // setup
      const username = 'user';
      // tslint:disable-next-line:no-string-literal
      userService['track'] = jest.fn();

      // action
      await userService.blockUser(username);

      // assertion
      // tslint:disable-next-line:no-string-literal
      expect(userService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(userService['track']).toHaveBeenCalledWith({
        action: 'block',
        user: username,
        id: 'some-id',
        name: 'toto@toto.com',
      });
    });

    it('should fall back in catch statement if update failed', async () => {
      // setup
      const username = 'user';
      userRepositoryMock.update.mockRejectedValueOnce('failed');
      // action
      try {
        await userService.blockUser(username);
      } catch (e) {
        const { message } = e;
        expect(e).toBeInstanceOf(Error);
        expect(message).toEqual(
          'The user could not be blocked due to a database error',
        );
        expect(loggerMock.error).toHaveBeenCalled();
      }

      // assertion
      expect.hasAssertions();
    });
  });

  describe('deleteUserById', () => {
    beforeEach(() => {
      userRepositoryMock.findOne.mockResolvedValue({
        email: 'toto@toto.com',
        roles: ['admin'],
        passwordHash: 'MyPass',
        secret: 'MySecret',
      });
    });
    it('calls the delete function of the userRepositoryMock', async () => {
      // set up
      const id = '123';
      const expectedRepositoryDeleteArguments = { id: '123' };
      const userMock = 'userMockValue';
      // action
      await userService.deleteUserById(id, userMock);
      // assertion
      expect(userRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.delete).toHaveBeenCalledWith(
        expectedRepositoryDeleteArguments,
      );
    });
    it('calls track()', async () => {
      // set up
      const id = '123';
      const expectedRepositoryDeleteArguments = { id: '123' };
      const userMock = 'userMockValue';
      // tslint:disable-next-line:no-string-literal
      userService['track'] = jest.fn();

      // action
      await userService.deleteUserById(id, userMock);
      // assertion
      // tslint:disable-next-line:no-string-literal
      expect(userService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(userService['track']).toHaveBeenCalledWith({
        action: 'delete',
        user: userMock,
        id,
        name: 'toto@toto.com',
      });
    });
  });

  describe('updateUserAccount', () => {
    it('should call updatePassword', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      // need to mock private call
      // tslint:disable-next-line: no-string-literal
      userService['compareHash'] = jest.fn().mockResolvedValueOnce(true);
      userService.updatePassword = jest.fn().mockResolvedValue(true);

      // action
      await userService.updateUserAccount(user, dataMock);

      // assert
      expect(userService.updatePassword).toHaveBeenCalledTimes(1);
      expect(userService.updatePassword).toHaveBeenCalledWith(
        user,
        dataMock.password,
        {},
      );
    });

    it('should fall back in else statement', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      // need to mock private call
      // tslint:disable-next-line: no-string-literal
      userService['compareHash'] = jest.fn().mockResolvedValueOnce(true);
      userService.updatePassword = jest.fn().mockRejectedValue(false);

      // action
      try {
        await userService.updateUserAccount(user, dataMock);
      } catch (err) {
        const message = err.message;

        // assertion
        expect(userService.updatePassword).toHaveBeenCalledTimes(1);
        expect(message).toEqual('password could not be updated');
      }
      expect.hasAssertions();
    });

    it('should not call updatePassword', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      const userMock = {
        passwordHash: 'y/cvxrzo6dRMIMD4dgdOGci',
      };
      // need to mock private call
      // tslint:disable-next-line: no-string-literal
      userService['compareHash'] = jest.fn().mockResolvedValueOnce(false);
      userService.updatePassword = jest.fn().mockResolvedValue(true);

      // action
      try {
        await userService.updateUserAccount(userMock, dataMock);
      } catch (err) {
        const message = err.message;

        // assert
        expect(userService.updatePassword).toHaveBeenCalledTimes(0);
        expect(message).toEqual(
          'password could not be updated because old password is invalid',
        );
      }
      expect.hasAssertions();
    });
  });

  describe('updatePassword', () => {
    beforeEach(() => {
      // need to mock the private mthod
      // tslint:disable-next-line: no-string-literal
      userService['savePassword'] = jest.fn();
    });

    it('should call userRepositoryMock.update', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      userService.findByUsername = jest.fn().mockResolvedValue({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'fred',
        roles: ['admin'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
      });
      // need to mock the private mthod
      // tslint:disable-next-line: no-string-literal
      userService['savePassword'] = jest.fn().mockResolvedValueOnce('ok');

      // action
      const result = await userService.updatePassword(
        user,
        dataMock.password,
        dataMock,
      );

      // assert
      // need to test the private
      // tslint:disable-next-line: no-string-literal
      expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Object);
    });

    it('should update a user password in connections failed historic', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      userService.findByUsername = jest.fn().mockResolvedValue({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'fred',
        roles: ['admin'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
      });
      // need to mock the private mthod
      // tslint:disable-next-line: no-string-literal
      userService['savePassword'] = jest.fn().mockResolvedValueOnce('ok');

      // action
      const result = await userService.updatePassword(
        user,
        dataMock.password,
        dataMock,
      );

      // assert
      // need to test the private
      // tslint:disable-next-line: no-string-literal
      expect(userService['savePassword']).toHaveBeenCalledTimes(1);
      // need to test the private
      // tslint:disable-next-line: no-string-literal
      expect(userService['savePassword']).toHaveBeenCalledWith(
        'fred',
        expect.any(String),
        expect.any(Date),
      );
      expect(result).toBeInstanceOf(Object);
    });

    it('should not update a user password', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      userService.findByUsername = jest.fn().mockResolvedValue({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'fred',
        roles: ['admin'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
      });
      // need to mock the private method
      // tslint:disable-next-line: no-string-literal
      userService['savePassword'] = jest.fn().mockRejectedValueOnce(false);

      // action
      try {
        await userService.updatePassword(user, dataMock.password, dataMock);
      } catch (err) {
        const message = err.message;

        // assert
        // need to test the private mthod
        // tslint:disable-next-line: no-string-literal
        expect(userService['savePassword']).toHaveBeenCalledTimes(1);
        // need to test the private
        // tslint:disable-next-line: no-string-literal
        expect(userService['savePassword']).toHaveBeenCalledWith(
          'fred',
          expect.any(String),
          expect.any(Date),
        );
        expect(message).toEqual('password could not be updated');
      }
      expect.hasAssertions();
    });

    it('calls track()', async () => {
      // setup
      const dataMock: IUserPasswordUpdateDTO = {
        currentPassword: 'MyPass20!!',
        password: 'MyPasswordIsValid10!!',
        passwordConfirmation: 'MyPasswordIsValid10!!',
      };
      userService.findByUsername = jest.fn().mockResolvedValue({
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        username: 'fred',
        roles: ['admin'],
        passwordHash:
          '$2b$10$UeDbulgX0zaMzviq/61wQeFWtpO97py/cvxrzo6dRMIMD4dgdOGci',
      });
      // need to mock the private mthod
      // tslint:disable-next-line: no-string-literal
      userService['savePassword'] = jest.fn().mockResolvedValueOnce('ok');
      // tslint:disable-next-line:no-string-literal
      userService['track'] = jest.fn();

      // action
      const result = await userService.updatePassword(
        user,
        dataMock.password,
        dataMock,
      );

      // assert
      // tslint:disable-next-line:no-string-literal
      expect(userService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(userService['track']).toHaveBeenCalledWith({
        action: 'updatePassword',
        user: user.username,
        id: 'ae21881b-0bba-4072-93b1-2436b3280c9f',
        name: user.email,
      });
    });
  });

  describe('passwordDoesNotContainUsername', () => {
    it('should return false if username is contained in the password', () => {
      // given
      const password = 'fredHasANotSecuredPassword10!!';
      // when
      const result = userService.passwordDoesNotContainUsername(
        password,
        user.username,
      );
      // then
      expect(result).toEqual(false);
    });

    it('should return false if username is contained in the password, case insensitively', () => {
      // given
      const password = 'fReDHasANotSecuredPassword10!!';
      // when
      const result = userService.passwordDoesNotContainUsername(
        password,
        user.username,
      );
      // then
      expect(result).toEqual(false);
    });

    it('should return true if username is not contained in the password', () => {
      // given
      const password = 'thePasswordIsSecured10!!';
      // when
      const result = userService.passwordDoesNotContainUsername(
        password,
        user.username,
      );
      // then
      expect(result).toEqual(true);
    });
  });

  describe('password validation', () => {
    const username = 'jean_moust';
    const password = 'georgesmoustaki';
    const passwordHash =
      '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e';

    describe('isEqualToTemporaryPassword', () => {
      it('should exist', () => {
        expect(userService.isEqualToTemporaryPassword).toBeDefined();
      });

      it('should return true if temporay password is the same as new password', async () => {
        // Action
        const result = await userService.isEqualToTemporaryPassword(
          'georgesmoustaki',
          passwordHash,
        );

        // Expected
        expect(result).toStrictEqual(true);
      });

      it('should return false if temporay password is different from new password', async () => {
        // Action
        const result = await userService.isEqualToTemporaryPassword(
          'georges',
          passwordHash,
        );

        // Expected
        expect(result).toStrictEqual(false);
      });
    });

    describe('isEqualToOneOfTheLastFivePasswords', () => {
      it('should exist', () => {
        expect(userService.isEqualToOneOfTheLastFivePasswords).toBeDefined();
      });

      it('should return true if current password is find in database', async () => {
        // Setup
        userRepositoryMock.findOne.mockImplementation(() =>
          Promise.resolve({
            username: 'jean_moust',
            email: 'toto@toto.com',
            roles: ['admin'],
            passwordHash:
              '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            secret: 'MySecret',
          }),
        );

        passwordRepositoryMock.find.mockImplementation(() =>
          Promise.resolve([
            {
              username: 'jean_moust',
              passwordHash:
                '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            },
            {
              username: 'jean_moust',
              passwordHash:
                '$2b$10$ZDZB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            },
            {
              username: 'jean_moust',
              passwordHash:
                '$2b$10$ZUOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            },
          ]),
        );

        // Action
        const result = await userService.isEqualToOneOfTheLastFivePasswords(
          username,
          password,
        );

        // Expected
        expect(userRepositoryMock.findOne).toHaveBeenCalledTimes(1);
        // expect(passwordRepositoryMock.find).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual(true);
      });

      it('should return false if current password is not find in database', async () => {
        // Setup
        userRepositoryMock.findOne.mockImplementation(() =>
          Promise.resolve({
            username: 'jean_moust',
            email: 'toto@toto.com',
            roles: ['admin'],
            passwordHash:
              '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            secret: 'MySecret',
          }),
        );

        passwordRepositoryMock.find.mockResolvedValue([
          {
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZDOY7VgMYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
          },
          {
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZDZB7VgGYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
          },
          {
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZUOB7VgBYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
          },
        ]);

        // Action
        const result = await userService.isEqualToOneOfTheLastFivePasswords(
          username,
          password,
        );

        // Expected
        expect(userRepositoryMock.findOne).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual(false);
      });
    });

    describe('savePassword', () => {
      it('should call checkIfOnlyFivePasswordsEntries', async () => {
        // Setup
        userService[
          // need to mock the private method
          // tslint:disable-next-line: no-string-literal
          'checkIfOnlyFivePasswordsEntries'
        ] = jest.fn().mockResolvedValueOnce(false);
        passwordRepositoryMock.save.mockResolvedValueOnce(true);
        const updatedAt = new Date();

        // Action
        // tslint:disable-next-line: no-string-literal
        await userService['savePassword'](username, passwordHash, updatedAt);

        // Expected
        expect(
          // tslint:disable-next-line: no-string-literal
          userService['checkIfOnlyFivePasswordsEntries'],
        ).toHaveBeenCalledTimes(1);
        expect(
          // tslint:disable-next-line: no-string-literal
          userService['checkIfOnlyFivePasswordsEntries'],
        ).toHaveBeenCalledWith(username);
      });

      it('should call passwordRepository.save', async () => {
        // Setup
        userService[
          // need to mock the private method
          // tslint:disable-next-line: no-string-literal
          'checkIfOnlyFivePasswordsEntries'
        ] = jest.fn().mockResolvedValueOnce(false);
        passwordRepositoryMock.save.mockResolvedValueOnce(true);
        const updatedAt = new Date();

        // Action
        // tslint:disable-next-line: no-string-literal
        await userService['savePassword'](username, passwordHash, updatedAt);

        // Expected
        expect(
          // tslint:disable-next-line: no-string-literal
          passwordRepositoryMock.save,
        ).toHaveBeenCalledTimes(1);
        expect(
          // tslint:disable-next-line: no-string-literal
          passwordRepositoryMock.save,
        ).toHaveBeenCalledWith({
          username,
          passwordHash,
          updatedAt,
        });
      });

      it('should not call passwordRepositoryMock.save if checkIfOnlyFivePasswordsEntries resolves to true', async () => {
        // Setup
        userService[
          // need to mock the private method
          // tslint:disable-next-line: no-string-literal
          'checkIfOnlyFivePasswordsEntries'
        ] = jest.fn().mockResolvedValueOnce(true);
        passwordRepositoryMock.save.mockRejectedValueOnce('failed');

        const updatedAt = new Date();

        // action
        // tslint:disable-next-line: no-string-literal
        await userService['savePassword'](username, passwordHash, updatedAt);

        // expect
        expect(
          // tslint:disable-next-line: no-string-literal
          passwordRepositoryMock.save,
        ).toHaveBeenCalledTimes(0);
      });

      it('should throw an error if checkIfOnlyFivePasswordsEntries reject', async () => {
        // Setup
        userService[
          // need to mock the private method
          // tslint:disable-next-line: no-string-literal
          'checkIfOnlyFivePasswordsEntries'
        ] = jest.fn().mockRejectedValueOnce(false);

        const updatedAt = new Date();
        // action
        try {
          // tslint:disable-next-line: no-string-literal
          await userService['savePassword'](username, passwordHash, updatedAt);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          const { message } = e;
          expect(message).toEqual('Cannot Save data in database');
          expect(loggerMock.error).toHaveBeenCalled();
        }

        // assertion
        expect.hasAssertions();
      });

      it('should throw an error if passwordHash can be saved in database', async () => {
        // Setup
        userService[
          // need to mock the private method
          // tslint:disable-next-line: no-string-literal
          'checkIfOnlyFivePasswordsEntries'
        ] = jest.fn().mockResolvedValueOnce(false);
        passwordRepositoryMock.save.mockRejectedValueOnce('failed');

        const updatedAt = new Date();
        // action
        try {
          // tslint:disable-next-line: no-string-literal
          await userService['savePassword'](username, passwordHash, updatedAt);
        } catch (e) {
          const { message } = e;
          expect(e).toBeInstanceOf(Error);
          expect(message).toEqual('Cannot Save data in database');
          expect(loggerMock.error).toHaveBeenCalled();
        }

        // assertion
        expect.hasAssertions();
      });
    });

    describe('checkIfOnlyFivePasswordsEntries', () => {
      const userMockData = {
        username: 'jean_moust',
        email: 'toto@toto.com',
        roles: ['admin'],
        passwordHash:
          '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
        secret: 'MySecret',
      };

      it('should exist', () => {
        // tslint:disable-next-line: no-string-literal
        expect(userService['checkIfOnlyFivePasswordsEntries']).toBeDefined();
      });

      it('should return true if five entries exit for a user', async () => {
        // Setup
        const userLastFivePassword = [
          {
            id: '1',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-05-06T12:59:01.436Z'),
          },
          {
            id: '2',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZDZB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-05-02T12:59:01.436Z'),
          },
          {
            id: '3',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZUOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-04-30T12:59:01.436Z'),
          },
          {
            id: '4',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$VDZB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-05-02T12:59:01.436Z'),
          },
          {
            id: '5',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$AUOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-04-30T12:59:01.436Z'),
          },
        ];
        userRepositoryMock.findOne.mockResolvedValueOnce(userMockData);
        passwordRepositoryMock.find.mockResolvedValueOnce(userLastFivePassword);
        // Action
        // tslint:disable-next-line: no-string-literal
        const result = await userService['checkIfOnlyFivePasswordsEntries'](
          username,
        );

        // Expected
        expect(result).toStrictEqual(true);
      });

      it('should return false if five entries exit for a user', async () => {
        // Setup
        const userLastFivePassword = [
          {
            id: '1',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-05-06T12:59:01.436Z'),
          },
          {
            id: '2',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZDZB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-05-02T12:59:01.436Z'),
          },
          {
            id: '3',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZUOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-04-30T12:59:01.436Z'),
          },
        ];

        userRepositoryMock.findOne.mockResolvedValueOnce(userMockData);

        passwordRepositoryMock.find.mockResolvedValueOnce(userLastFivePassword);

        // Action
        // tslint:disable-next-line: no-string-literal
        const result = await userService['checkIfOnlyFivePasswordsEntries'](
          userMockData.username,
        );

        // Expected
        expect(result).toStrictEqual(false);
      });

      it('should return false if five entries exit for a user', async () => {
        // Setup
        const userLastFivePassword = [
          {
            id: '1',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-05-06T12:59:01.436Z'),
          },
          {
            id: '2',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZDZB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-05-02T12:59:01.436Z'),
          },
          {
            id: '3',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$ZUOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-04-30T12:59:01.436Z'),
          },
        ];

        userRepositoryMock.findOne.mockResolvedValueOnce(userMockData);

        passwordRepositoryMock.find.mockRejectedValueOnce(
          new Error('The user could not be found due to a database error'),
        );

        // Action
        try {
          // tslint:disable-next-line: no-string-literal
          const result = await userService['checkIfOnlyFivePasswordsEntries'](
            userMockData.username,
          );
        } catch (e) {
          const { message } = e;
          expect(e).toBeInstanceOf(Error);
          expect(message).toEqual(
            'The user could not be found due to a database error',
          );
          expect(loggerMock.error).toHaveBeenCalled();
        }

        // Assertion
        expect.hasAssertions();
      });
    });

    describe('replaceOldPasswordsEntries', () => {
      const userMockData = {
        username: 'jean_moust',
        email: 'toto@toto.com',
        roles: ['admin'],
        passwordHash:
          '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
        secret: 'MySecret',
      };

      it('should exist', () => {
        // tslint:disable-next-line: no-string-literal
        expect(userService['replaceOldPasswordsEntries']).toBeDefined();
      });

      it('should replace the oldest password for a user if five entries are found', async () => {
        // Setup
        const updatedAt = new Date('2020-05-06T12:59:01.436Z');

        const expectedLastFivePassword = {
          id: '5',
          username: 'jean_moust',
          passwordHash:
            '$2b$10$AUTB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
          updatedAt: new Date('2020-04-22T16:59:01.436Z'),
        };

        const userLastFivePassword = [
          {
            id: '5',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$AUOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-02-30T12:59:01.436Z'),
          },
        ];

        userRepositoryMock.findOne.mockResolvedValueOnce(userMockData);

        passwordRepositoryMock.find.mockResolvedValueOnce(userLastFivePassword);

        passwordRepositoryMock.update.mockResolvedValueOnce(
          expectedLastFivePassword,
        );

        // tslint:disable-next-line: no-string-literal
        const result = await userService['replaceOldPasswordsEntries'](
          userLastFivePassword[0].username,
          userLastFivePassword[0].passwordHash,
          updatedAt,
        );

        expect(result).toStrictEqual(expectedLastFivePassword);
      });

      it('should throw an error if user data not found in password table', async () => {
        // Setup
        const updatedAt = new Date('2020-05-06T12:59:01.436Z');

        const userLastFivePassword = [
          {
            id: '5',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$AUOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-02-30T12:59:01.436Z'),
          },
        ];

        userRepositoryMock.findOne.mockResolvedValueOnce(userMockData);

        passwordRepositoryMock.find.mockRejectedValueOnce(
          new Error('The user could not be found due to a database error'),
        );

        try {
          // tslint:disable-next-line: no-string-literal
          await userService['replaceOldPasswordsEntries'](
            userLastFivePassword[0].username,
            userLastFivePassword[0].passwordHash,
            updatedAt,
          );
        } catch (e) {
          const { message } = e;
          expect(e).toBeInstanceOf(Error);
          expect(message).toEqual(
            'The user could not be found due to a database error',
          );
          expect(loggerMock.error).toHaveBeenCalled();
        }

        // Assertion
        expect.hasAssertions();
      });

      it('throw an error if user is not found in user table', async () => {
        // Setup
        const updatedAt = new Date('2020-05-06T12:59:01.436Z');

        const userLastFivePassword = [
          {
            id: '5',
            username: 'jean_moust',
            passwordHash:
              '$2b$10$AUOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e',
            updatedAt: new Date('2020-02-30T12:59:01.436Z'),
          },
        ];

        userRepositoryMock.findOne.mockRejectedValueOnce(
          new Error('The user could not be found due to a database error'),
        );

        try {
          // tslint:disable-next-line: no-string-literal
          await userService['replaceOldPasswordsEntries'](
            userLastFivePassword[0].username,
            userLastFivePassword[0].passwordHash,
            updatedAt,
          );
        } catch (e) {
          const { message } = e;
          expect(e).toBeInstanceOf(Error);
          expect(message).toEqual(
            'The user could not be found due to a database error',
          );
          expect(loggerMock.error).toHaveBeenCalled();
        }

        // Assertion
        expect.hasAssertions();
      });
    });
  });
});
