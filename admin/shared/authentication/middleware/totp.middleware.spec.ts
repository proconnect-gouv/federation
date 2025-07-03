import { Test } from '@nestjs/testing';
import { AuthenticationService } from '@fc/shared/authentication/authentication.service';
import {
  AuthenticationActions,
  AuthenticationStates,
} from '@fc/shared/authentication/authentication-actions.enum';
import { LoggerService } from '@fc/shared/logger/logger.service';
import { TotpMiddleware } from './totp.middleware';
import { UserService } from '@fc/shared/user/user.service';

describe('TotpMiddleware', () => {
  let totpMiddleware: TotpMiddleware;

  const optlibServiceMock = {
    authenticator: {
      options: {},
      check: jest.fn(),
    },
  };

  const authenticationServiceMock = {
    isMaxAuthenticationAttemptLimitReached: jest.fn(),
    saveUserAuthenticationFailure: jest.fn(),
    getUserSecret: jest.fn(),
  };
  const userServiceMock = {
    blockUser: jest.fn(),
    saveUserAuthenticationFailure: jest.fn(),
  };

  const loggerMock = {
    businessEvent: jest.fn(),
  };

  const req: any = {
    user: {
      user: 'Michel',
      secret: 'The tooth fairy is not real',
    },
    body: {
      username: 'toto',
      _totp: '123456',
    },
    flash: jest.fn(),
  };

  const res = {
    redirect: jest.fn(),
  };

  const next = jest.fn();

  beforeEach(async () => {
    jest.resetAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        TotpMiddleware,
        { provide: 'otplib', useValue: optlibServiceMock },
        AuthenticationService,
        LoggerService,
        UserService,
      ],
    })
      .overrideProvider(AuthenticationService)
      .useValue(authenticationServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(UserService)
      .useValue(userServiceMock)
      .compile();

    totpMiddleware = module.get<TotpMiddleware>(TotpMiddleware);
  });

  describe('use', () => {
    it('should call totpInForm if req.user is defined', async () => {
      // tslint:disable-next-line no-string-literal
      totpMiddleware['totpInForm'] = jest.fn();

      // Action
      await totpMiddleware.use(req, res, next);

      // Expected
      // tslint:disable-next-line no-string-literal
      expect(totpMiddleware['totpInForm']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line no-string-literal
      expect(totpMiddleware['totpInForm']).toHaveBeenCalledWith(req, next);
    });

    it('should call totpInLogging if req.user is not defined', async () => {
      // Setup
      const reqUserNotConnected = {
        user: null,
      };

      // tslint:disable-next-line: no-string-literal
      totpMiddleware['totpInLogging'] = jest.fn();

      // Action
      await totpMiddleware.use(reqUserNotConnected, res, next);

      // Expected
      // tslint:disable-next-line no-string-literal
      expect(totpMiddleware['totpInLogging']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line no-string-literal
      expect(totpMiddleware['totpInLogging']).toHaveBeenCalledWith(
        reqUserNotConnected,
        res,
        next,
      );
    });
  });

  describe('totpInForm', () => {
    it('should call "authenticator.check" with "req.body._totp" and "req.user.secret"', () => {
      // action
      // tslint:disable-next-line no-string-literal
      totpMiddleware['totpInForm'](req, next);

      // expect
      expect(optlibServiceMock.authenticator.check).toHaveBeenCalledTimes(1);
      expect(optlibServiceMock.authenticator.check).toHaveBeenCalledWith(
        req.body._totp,
        req.user.secret,
      );
    });

    it('should set "req._totp" to "valid" if "otplibService.authenticator.check" returns true', () => {
      // setup
      optlibServiceMock.authenticator.check.mockReturnValueOnce(true);

      // action
      // tslint:disable-next-line: no-string-literal
      totpMiddleware['totpInForm'](req, next);

      // expect
      expect(req.totp).toStrictEqual('valid');
    });

    it('should set "req._totp" to "invalid" if "otplibService.authenticator.check" returns false', () => {
      // setup
      optlibServiceMock.authenticator.check.mockReturnValueOnce(false);

      // action
      // tslint:disable-next-line: no-string-literal
      totpMiddleware['totpInForm'](req, next);

      // expect
      expect(req.totp).toStrictEqual('invalid');
    });

    it('should call "next" if "otplibService.authenticator.check" returns true', () => {
      // setup
      optlibServiceMock.authenticator.check.mockReturnValueOnce(true);

      // action
      // tslint:disable-next-line no-string-literal
      totpMiddleware['totpInForm'](req, next);

      // expect
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('should call "next" if "otplibService.authenticator.check" returns false', () => {
      // setup
      optlibServiceMock.authenticator.check.mockReturnValueOnce(false);

      // action
      // tslint:disable-next-line: no-string-literal
      totpMiddleware['totpInForm'](req, next);

      // expect
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('totpInLogging', () => {
    it('should call "authenticationService.getUserSecret" with the given "username" in body', async () => {
      // Action
      // tslint:disable-next-line no-string-literal
      await totpMiddleware['totpInLogging'](req, res, next);

      // Assertion
      expect(authenticationServiceMock.getUserSecret).toHaveBeenCalledTimes(1);
      expect(authenticationServiceMock.getUserSecret).toHaveBeenCalledWith(
        req.body.username,
      );
    });

    it('should log a "DENIED_USER_NOT_FOUND" businessEvent if there is no totp secret found for this username', async () => {
      // Setup
      authenticationServiceMock.getUserSecret.mockResolvedValueOnce(null);

      // Action
      // tslint:disable-next-line no-string-literal
      await totpMiddleware['totpInLogging'](req, res, next);

      // Assertion
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith({
        action: AuthenticationActions.TOTP,
        state: AuthenticationStates.DENIED_USER_NOT_FOUND,
        user: req.body.username,
      });
    });

    it('should redirect the user to /login with an error if there is no totp secret found for this username', async () => {
      // Setup
      authenticationServiceMock.getUserSecret.mockResolvedValueOnce(null);

      // Action
      // tslint:disable-next-line no-string-literal
      await totpMiddleware['totpInLogging'](req, res, next);

      // Assertion
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith(
        'globalError',
        'Connexion impossible.',
      );
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });

    it('should call "authenticator.check" with the given "totp" in body and the totp secret found in the database', async () => {
      // Setup
      authenticationServiceMock.getUserSecret.mockResolvedValueOnce('toto');

      // Action
      // tslint:disable-next-line no-string-literal
      await totpMiddleware['totpInLogging'](req, res, next);

      // Assertion
      expect(optlibServiceMock.authenticator.check).toHaveBeenCalledTimes(1);
      expect(optlibServiceMock.authenticator.check).toHaveBeenCalledWith(
        req.body._totp,
        req.userSecret,
      );
    });

    it('should call "handleUserTotpFailure" to retrieve the error message if the given "totp" in body is invalid', async () => {
      // Setup
      authenticationServiceMock.getUserSecret.mockResolvedValueOnce('toto');
      optlibServiceMock.authenticator.check.mockReturnValueOnce(false);
      // tslint:disable-next-line no-string-literal
      totpMiddleware['handleUserTotpFailure'] = jest.fn();

      // Action
      // tslint:disable-next-line no-string-literal
      await totpMiddleware['totpInLogging'](req, res, next);

      // Assertion
      // tslint:disable-next-line no-string-literal
      expect(totpMiddleware['handleUserTotpFailure']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line no-string-literal
      expect(totpMiddleware['handleUserTotpFailure']).toHaveBeenCalledWith(
        req.body.username,
      );
    });

    it('should log a "DENIED_TOTP" businessEvent if the given "totp" in body is invalid', async () => {
      // Setup
      authenticationServiceMock.getUserSecret.mockResolvedValueOnce('toto');
      optlibServiceMock.authenticator.check.mockReturnValueOnce(false);

      // Action
      // tslint:disable-next-line no-string-literal
      await totpMiddleware['totpInLogging'](req, res, next);

      // Assertion
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith({
        action: AuthenticationActions.TOTP,
        state: AuthenticationStates.DENIED_TOTP_INVALID,
        user: req.body.username,
      });
    });

    it('should redirect the user to /login with an error if the given "totp" in body is invalid', async () => {
      // Setup
      authenticationServiceMock.getUserSecret.mockResolvedValueOnce('toto');
      optlibServiceMock.authenticator.check.mockReturnValueOnce(false);
      // tslint:disable-next-line no-string-literal
      totpMiddleware['handleUserTotpFailure'] = jest
        .fn()
        .mockResolvedValueOnce('Connexion impossible.');

      // Action
      // tslint:disable-next-line no-string-literal
      await totpMiddleware['totpInLogging'](req, res, next);

      // Assertion
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(req.flash).toHaveBeenCalledWith(
        'globalError',
        'Connexion impossible.',
      );
    });

    it('should call next if the given "totp" and "username" in body are valid', async () => {
      // Setup
      authenticationServiceMock.getUserSecret.mockResolvedValueOnce('toto');
      optlibServiceMock.authenticator.check.mockReturnValueOnce(true);

      // Action
      // tslint:disable-next-line no-string-literal
      await totpMiddleware['totpInLogging'](req, res, next);

      // Assertion
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('handleUserTotpFailure', () => {
    it('should call "authenticationService.saveUserAuthenticationFailure" with the given username and null', async () => {
      // Action
      // tslint:disable-next-line no-string-literal
      await totpMiddleware['handleUserTotpFailure'](req.body.username);

      // Assertion
      expect(
        authenticationServiceMock.saveUserAuthenticationFailure,
      ).toHaveBeenCalledTimes(1);
      expect(
        authenticationServiceMock.saveUserAuthenticationFailure,
      ).toHaveBeenCalledWith(req.body.username, null);
    });

    it('should call "isMaxAuthenticationAttemptLimitReached" with the given username', async () => {
      // Setup
      authenticationServiceMock.saveUserAuthenticationFailure.mockResolvedValueOnce(
        {
          id: '123465',
          username: 'toto',
        },
      );

      // Action
      // tslint:disable-next-line no-string-literal
      await totpMiddleware['handleUserTotpFailure'](req.body.username);

      // Assertion
      expect(
        authenticationServiceMock.isMaxAuthenticationAttemptLimitReached,
      ).toHaveBeenCalledTimes(1);
      expect(
        authenticationServiceMock.isMaxAuthenticationAttemptLimitReached,
      ).toHaveBeenCalledWith(req.body.username);
    });

    it('should block the user if the max authentication attempts is reached', async () => {
      // Setup
      authenticationServiceMock.saveUserAuthenticationFailure.mockResolvedValueOnce(
        {
          id: '123465',
          username: 'toto',
        },
      );
      authenticationServiceMock.isMaxAuthenticationAttemptLimitReached.mockResolvedValueOnce(
        true,
      );

      // Action
      // tslint:disable-next-line no-string-literal
      await totpMiddleware['handleUserTotpFailure'](req.body.username);

      // Assertion
      expect(userServiceMock.blockUser).toHaveBeenCalledTimes(1);
      expect(userServiceMock.blockUser).toHaveBeenCalledWith(req.body.username);
    });

    it('should return the default error message if the user was not blocked', async () => {
      // Setup
      authenticationServiceMock.saveUserAuthenticationFailure.mockResolvedValueOnce(
        {
          id: '123465',
          username: 'toto',
        },
      );
      authenticationServiceMock.isMaxAuthenticationAttemptLimitReached.mockResolvedValueOnce(
        false,
      );

      // Action
      // tslint:disable-next-line no-string-literal
      const result = await totpMiddleware['handleUserTotpFailure'](
        req.body.username,
      );

      // Assertion
      expect(result).toStrictEqual('Connexion impossible.');
    });

    it('should set the specific error message if the user was blocked', async () => {
      // Setup
      authenticationServiceMock.saveUserAuthenticationFailure.mockResolvedValueOnce(
        {
          id: '123465',
          username: 'toto',
        },
      );
      authenticationServiceMock.isMaxAuthenticationAttemptLimitReached.mockResolvedValueOnce(
        true,
      );

      // Action
      // tslint:disable-next-line no-string-literal
      const result = await totpMiddleware['handleUserTotpFailure'](
        req.body.username,
      );

      // Assertion
      expect(result).toStrictEqual(
        "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
      );
    });
  });
});
