import { LocalStrategy } from './local.strategy';
import { LoggerService } from '@fc/shared/logger/logger.service';
import {
  AuthenticationActions,
  AuthenticationStates,
} from '../authentication-actions.enum';
import { UserRole } from '../../user/roles.enum';
import { UserService } from '../../user/user.service';
import { AuthenticationService } from '../authentication.service';

describe('LocalStrategy', () => {
  const authenticationServiceMock = {
    validateCredentials: jest.fn(),
    getAuthenticationFailureReason: jest.fn(),
    getAuthenticationAttemptCount: jest.fn(),
    saveUserAuthenticationFailure: jest.fn(),
    getUserSecret: jest.fn(),
    deleteUserAuthenticationFailures: jest.fn(),
    isMaxAuthenticationAttemptLimitReached: jest.fn(),
  };
  const businessEventMock = jest.fn();
  const loggerMock = {
    businessEvent: businessEventMock,
  };

  const userServiceMock = {
    blockUser: jest.fn(),
    findByUsername: jest.fn(),
  };

  let localStrategyMock;

  const req = {
    params: {},
    flash: jest.fn(),
    csrfToken: function csrfToken() {
      return 'mygreatcsrftoken';
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();

    localStrategyMock = new LocalStrategy(
      (authenticationServiceMock as unknown) as AuthenticationService,
      (loggerMock as unknown) as LoggerService,
      (userServiceMock as unknown) as UserService,
    );
  });

  describe('validate', () => {
    it('should validate the regular user authentication', async () => {
      // setup
      authenticationServiceMock.validateCredentials.mockResolvedValue({
        username: 'user',
        roles: ['admin', 'operator'],
      });
      // action
      const result = await localStrategyMock.validate(req, 'user', 'toto');
      // assertion
      expect(result).toEqual({
        roles: ['admin', 'operator'],
        username: 'user',
      });
      expect(req.flash).toHaveBeenCalledTimes(0);
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(0);
    });

    it('should validate the new user authentication', async () => {
      // setup
      const mockDate = new Date();
      mockDate.setFullYear(mockDate.getFullYear() + 10);
      const reqStub = {
        params: {
          token: '123456',
        },
        flash: jest.fn(),
        csrfToken: function csrfToken() {
          return 'mygreatcsrftoken';
        },
      };
      authenticationServiceMock.validateCredentials.mockResolvedValue({
        username: 'user',
        roles: ['new_account', 'inactive_operator'],
        tokenExpiresAt: mockDate,
      });

      // action
      const result = await localStrategyMock.validate(reqStub, 'user', 'toto');

      // assertion
      expect(
        authenticationServiceMock.deleteUserAuthenticationFailures,
      ).toHaveBeenCalledTimes(1);
      expect(
        authenticationServiceMock.deleteUserAuthenticationFailures,
      ).toHaveBeenCalledWith('user');
      expect(result).toEqual({
        roles: ['new_account', 'inactive_operator'],
        tokenExpiresAt: mockDate,
        username: 'user',
      });
      expect(req.flash).toHaveBeenCalledTimes(0);
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(0);
    });

    it('should send back failure reason', async () => {
      // setup
      const reqStub = {
        params: {
          token: '123456',
        },
        flash: jest.fn(),
        csrfToken: function csrfToken() {
          return 'mygreatcsrftoken';
        },
      };
      authenticationServiceMock.validateCredentials.mockResolvedValueOnce(
        undefined,
      );
      authenticationServiceMock.getAuthenticationFailureReason.mockResolvedValueOnce(
        AuthenticationStates.DENIED_USER_NOT_FOUND,
      );
      const mockDate = new Date();
      mockDate.setFullYear(mockDate.getFullYear());

      // action
      const result = await localStrategyMock.validate(reqStub, 'user', 'toto');

      // asertion
      expect(result).toEqual(null);
      expect(
        authenticationServiceMock.saveUserAuthenticationFailure,
      ).toHaveBeenCalledWith('user', '123456');
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith({
        action: 'token_signup',
        state: 'DENIED_USER_NOT_FOUND',
        user: 'user',
      });
      expect(reqStub.flash).toHaveBeenCalledTimes(1);
      expect(reqStub.flash).toHaveBeenCalledWith(
        'error',
        'Connexion impossible',
      );
    });

    it('should send back failure reason with a specific message if the user exceeded his authentication attempts limit', async () => {
      // setup
      const reqStub = {
        params: {
          token: '123456',
        },
        flash: jest.fn(),
        csrfToken: function csrfToken() {
          return 'mygreatcsrftoken';
        },
      };
      authenticationServiceMock.validateCredentials.mockResolvedValueOnce(
        undefined,
      );
      authenticationServiceMock.getAuthenticationFailureReason.mockResolvedValueOnce(
        AuthenticationStates.DENIED_MAX_AUTHENTICATION_ATTEMPTS_REACHED,
      );
      const mockDate = new Date();
      mockDate.setFullYear(mockDate.getFullYear());
      // We need this syntax to test or mock privates methods
      // tslint:disable-next-line no-string-literal
      const originalBlockUser = localStrategyMock['blockUser'];
      // We need this syntax to test or mock privates methods
      // tslint:disable-next-line no-string-literal
      localStrategyMock['blockUser'] = jest.fn();
      // We need this syntax to test or mock privates methods
      // tslint:disable-next-line no-string-literal
      localStrategyMock['blockUser'].mockResolvedValueOnce({
        id: '123456',
        username: 'user',
        token: '123456',
        authenticationAttemptedAt: mockDate,
      });

      // action
      const result = await localStrategyMock.validate(reqStub, 'user', 'toto');

      // asertion
      expect(result).toEqual(null);
      // We need this syntax to test or mock privates methods
      // tslint:disable-next-line no-string-literal
      expect(localStrategyMock['blockUser']).toHaveBeenCalledWith('user');
      expect(
        authenticationServiceMock.saveUserAuthenticationFailure,
      ).toHaveBeenCalledWith('user', '123456');
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith({
        action: 'token_signup',
        state: 'DENIED_MAX_AUTHENTICATION_ATTEMPTS_REACHED',
        user: 'user',
      });
      expect(reqStub.flash).toHaveBeenCalledTimes(1);
      expect(reqStub.flash).toHaveBeenCalledWith(
        'error',
        "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
      );

      // restore
      // We need this syntax to test or mock privates methods
      // tslint:disable-next-line no-string-literal
      localStrategyMock['blockUser'] = originalBlockUser;
    });

    it('should send back failure reason with a specific message in case user is blocked', async () => {
      // setup
      authenticationServiceMock.validateCredentials.mockResolvedValueOnce(
        undefined,
      );
      authenticationServiceMock.getAuthenticationFailureReason.mockResolvedValueOnce(
        AuthenticationStates.DENIED_BLOCKED_USER,
      );
      const mockDate = new Date();
      mockDate.setFullYear(mockDate.getFullYear());

      // action
      const result = await localStrategyMock.validate(req, 'user', 'toto');

      // asertion
      expect(result).toEqual(null);
      expect(
        authenticationServiceMock.saveUserAuthenticationFailure,
      ).toHaveBeenCalledWith('user', undefined);
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith({
        action: 'signin',
        state: 'DENIED_BLOCKED_USER',
        user: 'user',
      });
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith(
        'error',
        "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur",
      );
    });
  });

  describe('sendBackFailureReason', () => {
    it('should log the failure reason', () => {
      // setup
      const reqStub = {
        params: {
          token: '123456',
        },
        flash: jest.fn(),
        csrfToken: function csrfToken() {
          return 'mygreatcsrftoken';
        },
      };
      const token = '123456';

      // action
      localStrategyMock[
        // We need this syntax to test or mock privates methods
        // tslint:disable-next-line no-string-literal
        'sendBackFailureReason'
      ](
        AuthenticationStates.DENIED_USER_NOT_FOUND,
        'user',
        reqStub,
        'Connexion impossible',
        token,
      );

      // assertion
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith({
        action: AuthenticationActions.TOKEN_SIGNUP,
        state: 'DENIED_USER_NOT_FOUND',
        user: 'user',
      });
    });

    it('should flash the error to the user', () => {
      // setup
      const reqStub = {
        params: {
          token: '123456',
        },
        flash: jest.fn(),
        csrfToken: function csrfToken() {
          return 'mygreatcsrftoken';
        },
      };
      const token = '123456';

      // action
      localStrategyMock[
        // We need this syntax to test or mock privates methods
        // tslint:disable-next-line no-string-literal
        'sendBackFailureReason'
      ](
        AuthenticationStates.DENIED_USER_NOT_FOUND,
        'user',
        reqStub,
        'Connexion impossible',
        token,
      );

      // assertion
      expect(reqStub.flash).toHaveBeenCalledTimes(1);
      expect(reqStub.flash).toHaveBeenCalledWith(
        'error',
        'Connexion impossible',
      );
    });
  });

  describe('blockUser', () => {
    it('should call block user of userService', async () => {
      // setup
      const username = 'user';
      const mockDateCreate = new Date();
      const mockDateExpire = new Date();
      mockDateCreate.setFullYear(mockDateCreate.getFullYear() - 2);
      mockDateExpire.setFullYear(mockDateExpire.getFullYear() - 1);
      userServiceMock.blockUser.mockResolvedValue({
        id: '12346',
        email: 'user@user.com',
        passwordHash: 'kjlkjlksdjflkjsdflkjsdlkfj',
        secret: 'shut',
        username: 'user',
        roles: [UserRole.BLOCKED_USER],
        token: '12346',
        tokenCreatedAt: mockDateCreate,
        tokenExpiresAt: mockDateExpire,
      });
      // action
      const result = await localStrategyMock[
        // We need this syntax to test or mock privates methods
        // tslint:disable-next-line no-string-literal
        'blockUser'
      ](username);
      // assertion
      expect(result).toEqual({
        id: '12346',
        email: 'user@user.com',
        passwordHash: 'kjlkjlksdjflkjsdflkjsdlkfj',
        secret: 'shut',
        username: 'user',
        roles: [UserRole.BLOCKED_USER],
        token: '12346',
        tokenCreatedAt: mockDateCreate,
        tokenExpiresAt: mockDateExpire,
      });
    });
  });
});
