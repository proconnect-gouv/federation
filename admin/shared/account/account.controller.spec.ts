import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@fc/shared/user/roles.enum';
import { UserService } from '@fc/shared/user/user.service';
import { User } from '@fc/shared/user/user.sql.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { EnrollUserDto } from './dto/enroll-user.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { TotpService } from '@fc/shared/authentication/totp/totp.service';

describe('AccountController', () => {
  let accountController: AccountController;
  let service: AccountService;

  const serviceMock = {
    paginate: jest.fn(),
  };

  const userService = {
    compareHash: jest.fn(),
    findByUsername: jest.fn(),
    createUser: jest.fn(),
    deleteUserById: jest.fn(),
    generateTmpPass: jest.fn(),
    enrollUser: jest.fn(),
    updateUserAccount: jest.fn(),
    passwordDoesNotContainUsername: jest.fn(),
    isEqualToTemporaryPassword: jest.fn(),
    isEqualToOneOfTheLastFivePasswords: jest.fn(),
  };
  const res = {
    redirect: jest.fn(),
    status: jest.fn(),
    render: jest.fn(),
    locals: {
      APP_ROOT: '/foo/bar',
    },
  };

  const totpService = {
    generateTotpQRCode: jest.fn(),
    generateTotpSecret: jest.fn(),
  };
  let req;

  const updateAccountDto = new UpdateAccountDto(
    'georgesmooustaki',
    'MyPassword10!!',
    'MyPassword10!!',
  );
  const createUserDto = new CreateUserDto(
    'jean_moust',
    'jean@moust.lol',
    'yolo',
    [UserRole.OPERATOR],
    '1234',
  );
  const enrollUserDto = new EnrollUserDto(
    'YouWontFindIt#999',
    'YouWontFindIt#999',
  );
  const userRepository = {
    find: jest.fn(),
  };

  const mockedGeneratePassword = {
    generate: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([User])],
      controllers: [AccountController],
      providers: [
        UserService,
        TotpService,
        AccountService,
        {
          provide: getRepositoryToken(AccountService),
          useClass: Repository,
        },
        { provide: 'generatePassword', useValue: mockedGeneratePassword },
      ],
    })
      .overrideProvider(UserService)
      .useValue(userService)
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepository)
      .overrideProvider(AccountService)
      .useValue(serviceMock)
      .overrideProvider(TotpService)
      .useValue(totpService)
      .compile();

    accountController = module.get<AccountController>(AccountController);
    service = await module.get<AccountService>(AccountService);

    req = {
      flash: jest.fn(),
      user: {
        id: '05e4fadf-fda6-4ad8-ae75-b7f315843827',
        roles: [],
        username: 'userNameValue',
      },
      body: {
        roles: ['admin', 'operator'],
        secret: jest.fn(),
      },
      csrfToken: function csrfToken() {
        return 'mygreatcsrftoken';
      },
    };

    jest.resetAllMocks();
    totpService.generateTotpQRCode.mockReturnValueOnce({
      user: 'toto',
      issuer: 'fce',
      secret: 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
      QRCode: 'base64ImageQRCode',
      step: 30,
      algorithm: 'sha1',
    });
    totpService.generateTotpSecret.mockReturnValueOnce(
      'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
    );
    res.status.mockReturnValueOnce(res);
    mockedGeneratePassword.generate.mockReturnValueOnce('mygreattmppassword');
  });

  describe('list', () => {
    it('returns all the users', async () => {
      // Setup
      const page = '0';
      const limit = '10';

      // Mocking Items
      const itemTest1: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest2: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest3: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest4: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest5: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest6: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest7: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest8: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest9: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest10: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest11: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest12: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };

      // Mocking return value of serviceProviderController.list(page, limit)
      const user = {
        items: [
          itemTest1,
          itemTest2,
          itemTest3,
          itemTest4,
          itemTest5,
          itemTest6,
          itemTest7,
          itemTest8,
          itemTest9,
          itemTest10,
          itemTest11,
          itemTest12,
        ],
        itemCount: 12,
        totalItems: 12,
        totalUsers: 12,
        pageCount: 2,
        next: '/account?page=2&limit=10',
        previous: '',
      };

      // Actions
      // Mocking the return of the paginate function
      const result: Promise<Pagination<User>> = Promise.resolve(user);

      // Mocking the return of service paginte function
      const spy = jest
        .spyOn(service, 'paginate')
        .mockImplementation(() => Promise.resolve(result));

      // Calling the list function
      const resultat = await accountController.list(req, page, limit);

      // Expected
      expect(spy).toHaveBeenCalled();
      expect(resultat.total).toEqual(12);
      expect(resultat.users.length).toEqual(12);
    });
  });

  describe('createUser', () => {
    it('Get create user', () => {
      // setup
      userService.generateTmpPass.mockImplementationOnce(() => {
        return 'mygreattmppassword';
      });
      // action
      const { csrfToken, tmpPassword } = accountController.showCreationForm(
        req,
      );
      // assertion
      expect(userService.generateTmpPass).toHaveBeenCalledTimes(1);
      expect(csrfToken).toEqual('mygreatcsrftoken');
      expect(tmpPassword).toEqual('mygreattmppassword');
    });
  });

  describe('Post create user', () => {
    it('redirects the user when a valid user is provided', async () => {
      // setup
      userService.createUser.mockImplementation(() => Promise.resolve(true));
      // action
      await accountController.createUser(createUserDto, req, res);
      // assertion
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account');
    });

    it('uses the user service to create users', async () => {
      // setup
      const expectedUser = {
        email: 'jean@moust.lol',
        password: 'yolo',
        roles: ['inactive_operator', 'new_account'],
        secret: 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
        username: 'jean_moust',
      };

      // action
      await accountController.createUser(createUserDto, req, res);

      expect(userService.createUser).toHaveBeenCalledTimes(1);
      expect(userService.createUser).toHaveBeenCalledWith(
        expectedUser,
        req.user.username,
      );
    });

    it('falls back in the catch when a not valid user is provided', async () => {
      // setup
      userService.createUser.mockImplementation(() =>
        Promise.reject(new Error('wrong, buddy')),
      );
      // action
      await accountController.createUser(createUserDto, req, res);
      // assertion
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account/create');
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith('globalError', { code: '23505' });
    });
  });

  describe('get enrollment', () => {
    it('should generate qr code and return values to enter totp code without scanning qrcode', async () => {
      // action
      const {
        user,
        issuer,
        secret,
        QRCode,
        step,
        algorithm,
        csrfToken,
      } = await accountController.firstLogin(req, res);
      // assertion
      expect(user).toEqual('toto');
      expect(issuer).toEqual('fce');
      expect(secret).toEqual('KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD');
      expect(QRCode).toEqual('base64ImageQRCode');
      expect(step).toEqual(30);
      expect(algorithm).toEqual('sha1');
      expect(csrfToken).toEqual('mygreatcsrftoken');
    });
  });

  describe('Patch enrollment new User', () => {
    it('should update a new user and redirect to the account page if the user has only the role admin', async () => {
      // setup
      req.user.roles = ['new_account', 'inactive_admin'];
      userService.passwordDoesNotContainUsername.mockReturnValueOnce(true);
      userService.isEqualToTemporaryPassword.mockReturnValueOnce(false);
      userService.enrollUser.mockImplementation(() => Promise.resolve(true));
      // action
      await accountController.enrollUser(enrollUserDto, req, res);
      // assertion
      expect(userService.enrollUser).toHaveBeenCalledTimes(1);
      expect(userService.enrollUser).toHaveBeenCalledWith(
        req.user,
        enrollUserDto,
      );
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/');
    });
    it("should fall back in the catch statement if user's updated password and password confirmation do not respect the dto", async () => {
      // setup
      userService.passwordDoesNotContainUsername.mockReturnValueOnce(true);
      userService.isEqualToTemporaryPassword.mockReturnValueOnce(false);
      userService.enrollUser.mockImplementation(() =>
        Promise.reject(new Error('wrong, buddy')),
      );
      // action
      await accountController.enrollUser(
        {
          password: 'mypasswordoesnotrespectthedto',
          passwordConfirmation: 'mypasswordoesnotrespectthedto',
        },
        req,
        res,
      );
      // assertion
      expect(userService.enrollUser).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account/enrollment');
    });

    it('should call req flash and redirect the user to the enrollment page', async () => {
      // setup
      const enrollUserDtoMock: EnrollUserDto = {
        password: 'fredIsNotSecured10!!',
        passwordConfirmation: 'fredIsNotSecured10!!',
      };
      req.body.password = 'fredIsNotSecured10!!';
      req.body.passwordConfirmation = 'fredIsNotSecured10!!';
      req.user.username = 'fred';
      userService.passwordDoesNotContainUsername.mockReturnValueOnce(false);
      // action
      await accountController.enrollUser(enrollUserDtoMock, req, res);
      // assertion
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith(
        'globalError',
        "Votre nouveau mot de passe contient votre nom d'utilisateur",
      );
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account/enrollment');
    });

    it('should not call req flash with a globalError', async () => {
      // setup
      const enrollUserDtoMock: EnrollUserDto = {
        password: 'fredIsNotSecured10!!',
        passwordConfirmation: 'fredIsNotSecured10!!',
      };
      req.body.password = 'fredIsNotSecured10!!';
      req.body.passwordConfirmation = 'fredIsNotSecured10!!';
      req.user.username = 'fred';
      userService.passwordDoesNotContainUsername.mockReturnValueOnce(true);
      userService.enrollUser.mockImplementation(() => Promise.resolve(true));
      // action
      await accountController.enrollUser(enrollUserDtoMock, req, res);
      // assertion
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith(
        'success',
        'Le mot de passe a bien été mis à jour !',
      );
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/');
    });

    describe('temporary password check', () => {
      test('should call req flash if temporary password is reused', async () => {
        // setup
        const password = 'georgesmoustaki';
        const hash =
          '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e';
        const enrollUserDtoMock: EnrollUserDto = {
          password,
          passwordConfirmation: password,
        };
        req.body.password = password;
        req.body.passwordConfirmation = password;
        req.user.username = 'jean_moust';
        req.user.passwordHash = hash;
        userService.passwordDoesNotContainUsername.mockReturnValueOnce(true);
        userService.isEqualToTemporaryPassword.mockReturnValueOnce(true);
        // action
        await accountController.enrollUser(enrollUserDtoMock, req, res);
        // assertion
        expect(req.flash).toHaveBeenCalledTimes(1);
        expect(req.flash).toHaveBeenCalledWith(
          'globalError',
          'Votre nouveau mot de passe ne peut pas être le mot de passe temporaire.',
        );
      });

      test('should call res redirect to the enrollment page  if temporary password is reused', async () => {
        // setup
        const password = 'georgesmoustaki';
        const hash =
          '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e';
        const enrollUserDtoMock: EnrollUserDto = {
          password,
          passwordConfirmation: password,
        };
        req.body.password = password;
        req.body.passwordConfirmation = password;
        req.user.username = 'jean_moust';
        req.user.passwordHash = hash;
        userService.passwordDoesNotContainUsername.mockReturnValueOnce(true);
        userService.isEqualToTemporaryPassword.mockReturnValueOnce(true);
        // action
        await accountController.enrollUser(enrollUserDtoMock, req, res);
        // assertion
        expect(res.redirect).toHaveBeenCalledTimes(1);
        expect(res.redirect).toHaveBeenCalledWith(
          '/foo/bar/account/enrollment',
        );
      });
    });

    describe('Passwords check', () => {
      test('should call res redirect to the enrollment page  if temporary password is reused', async () => {
        // setup
        const password = 'georgesmoustaki';
        const hash =
          '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e';
        const enrollUserDtoMock: EnrollUserDto = {
          password,
          passwordConfirmation: password,
        };
        req.body.password = password;
        req.body.passwordConfirmation = password;
        req.user.username = 'jean_moust';
        req.user.passwordHash = hash;
        userService.passwordDoesNotContainUsername.mockReturnValueOnce(true);
        userService.isEqualToTemporaryPassword.mockReturnValueOnce(true);
        userService.isEqualToOneOfTheLastFivePasswords.mockReturnValueOnce(
          false,
        );
        // action
        await accountController.enrollUser(enrollUserDtoMock, req, res);
        // assertion
        expect(res.redirect).toHaveBeenCalledTimes(1);
        expect(res.redirect).toHaveBeenCalledWith(
          '/foo/bar/account/enrollment',
        );
      });
    });
  });

  describe('delete', () => {
    it('should call deleteUser of the user service with the provided id', async () => {
      // set up
      const id = 'd3d3f8a1-26ea-4a8b-9ed3-336d3777b529';
      // action
      await accountController.deleteUser(id, req, res);
      // assertion
      expect(userService.deleteUserById).toHaveBeenCalledTimes(1);
      expect(userService.deleteUserById).toHaveBeenCalledWith(
        id,
        req.user.username,
      );
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account');
    });

    it('should not call deleteUser of the user service but redirect the user to the /account page', async () => {
      // set up
      const id = '05e4fadf-fda6-4ad8-ae75-b7f315843827';
      // action
      await accountController.deleteUser(id, req, res);
      // assertion
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account');
      expect(userService.deleteUserById).toHaveBeenCalledTimes(0);
    });

    it('should not redirect the user but set the res status to 500 for the error handler', async () => {
      // set up
      userService.deleteUserById = jest.fn(() => {
        throw Error;
      });
      const id = '2d1280f1-1611-42fa-968a-47e450e0aeba';
      // action
      await accountController.deleteUser(id, req, res);
      // assertion
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.redirect).toHaveBeenCalledTimes(0);
      expect(userService.deleteUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('user account', () => {
    describe('get account/me', () => {
      it('showUserAccount', async () => {
        // action
        const {
          user,
          issuer,
          secret,
          QRCode,
          step,
          algorithm,
          csrfToken,
        } = await accountController.showUserAccount(req);
        // assertion
        expect(totpService.generateTotpQRCode).toHaveBeenCalledTimes(1);
        expect(totpService.generateTotpQRCode).toHaveBeenCalledWith(req.user);
        expect(user).toEqual('toto');
        expect(issuer).toEqual('fce');
        expect(secret).toEqual('KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD');
        expect(QRCode).toEqual('base64ImageQRCode');
        expect(step).toEqual(30);
        expect(algorithm).toEqual('sha1');
        expect(csrfToken).toEqual('mygreatcsrftoken');
      });
    });

    describe('patch update-account/:username', () => {
      it('updates the user account', async () => {
        // setup
        req.body = {
          __csrf: 'mygreatcsrftoken',
          currentPassword: 'MyPass10!!',
          password: 'MyNewPass20!!',
          passwordConfirmation: 'MyNewPass20!!!!',
          _totp: 123456,
        };
        userService.passwordDoesNotContainUsername.mockReturnValueOnce(true);
        // action
        await accountController.updateUserPassword(updateAccountDto, req, res);
        // assert
        expect(userService.updateUserAccount).toHaveBeenCalledTimes(1);
        expect(userService.updateUserAccount).toHaveBeenCalledWith(
          req.user,
          updateAccountDto,
        );
        expect(req.flash).toHaveBeenCalledTimes(1);
        expect(req.flash).toHaveBeenCalledWith(
          'success',
          `Le mot de passe a bien été mis à jour !`,
        );
        expect(res.redirect).toHaveBeenCalledTimes(1);
        expect(res.redirect).toHaveBeenCalledWith('/foo/bar/');
      });

      it('does not update the user password', async () => {
        // setup
        userService.passwordDoesNotContainUsername.mockReturnValueOnce(true);
        userService.updateUserAccount = jest.fn(() => {
          throw Error;
        });
        // action
        await accountController.updateUserPassword(updateAccountDto, req, res);
        // assert
        expect(userService.updateUserAccount).toHaveBeenCalledTimes(1);
        expect(userService.updateUserAccount).toHaveBeenCalledWith(
          req.user,
          updateAccountDto,
        );
        expect(req.flash).toHaveBeenCalledTimes(1);
        expect(req.flash).toHaveBeenCalledWith(
          'globalError',
          'Nouveau mot de passe non mis à jour, Ancien mot de passe incorrect.',
        );
        expect(res.redirect).toHaveBeenCalledTimes(1);
        expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account/me');
      });

      it('should call req flash and redirect the user to the update account page', async () => {
        // setup
        req.body = {
          __csrf: 'mygreatcsrftoken',
          currentPassword: 'MyPass10!!',
          password: 'MyNewPass20!!',
          passwordConfirmation: 'MyNewPass20!!!!',
          _totp: 123456,
        };
        userService.passwordDoesNotContainUsername.mockReturnValueOnce(false);
        // action
        await accountController.updateUserPassword(updateAccountDto, req, res);
        // assert
        expect(userService.updateUserAccount).toHaveBeenCalledTimes(0);
        expect(req.flash).toHaveBeenCalledTimes(1);
        expect(req.flash).toHaveBeenCalledWith(
          'globalError',
          "Votre nouveau mot de passe contient votre nom d'utilisateur",
        );
        expect(res.redirect).toHaveBeenCalledTimes(1);
        expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account/me');
      });

      test('should call req flash if one of the last five password is reused', async () => {
        // setup
        const password = 'georgesmoustaki';
        const hash =
          '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e';

        req.body.password = password;
        req.body.passwordConfirmation = password;
        req.user.username = 'jean_moust';
        req.user.passwordHash = hash;
        userService.passwordDoesNotContainUsername.mockReturnValueOnce(true);
        userService.isEqualToTemporaryPassword.mockReturnValueOnce(false);
        userService.isEqualToOneOfTheLastFivePasswords.mockReturnValueOnce(
          true,
        );
        // action
        await accountController.updateUserPassword(updateAccountDto, req, res);
        // assertion
        expect(req.flash).toHaveBeenCalledTimes(1);
        expect(req.flash).toHaveBeenCalledWith(
          'globalError',
          "Votre nouveau mot de passe ne peut être l'un des cinq derniers mots de passe utilisés",
        );
        expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account/me');
      });

      test('should not call req flash if none of the last five password is reused', async () => {
        // setup
        const password = 'georgesmoustaki';
        const hash =
          '$2b$10$ZDOB7VgNYb.L3mTyf2yQduc9X6AItJmYhEFD0ea30kVXEURcJi31e';

        req.body.password = password;
        req.body.passwordConfirmation = password;
        req.user.username = 'jean_moust';
        req.user.passwordHash = hash;
        userService.passwordDoesNotContainUsername.mockReturnValueOnce(true);
        userService.isEqualToTemporaryPassword.mockReturnValueOnce(false);
        userService.isEqualToOneOfTheLastFivePasswords.mockReturnValueOnce(
          false,
        );
        // action
        await accountController.updateUserPassword(updateAccountDto, req, res);
        // assertion
        expect(req.flash).toHaveBeenCalledTimes(1);
        expect(req.flash).toHaveBeenCalledWith(
          'success',
          `Le mot de passe a bien été mis à jour !`,
        );
        expect(res.redirect).toHaveBeenCalledTimes(1);
        expect(res.redirect).toHaveBeenCalledWith('/foo/bar/');
      });
    });
  });
});
