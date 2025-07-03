import { AuthenticationController } from './authentication.controller';
import { LoggerService } from '@fc/shared/logger/logger.service';
import {
  AuthenticationActions,
  AuthenticationStates,
} from './authentication-actions.enum';

describe('AuthenticationController', () => {
  const businessEventMock = jest.fn();
  const loggerMock = ({
    businessEvent: businessEventMock,
  } as unknown) as LoggerService;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const authenticationController = new AuthenticationController(loggerMock);

  describe('firstLoginView', () => {
    it('should return the login page with a csrf token', () => {
      // setup
      const req = {
        csrfToken: function csrfToken() {
          return 'mygreatcsrftoken';
        },
      };

      // action
      const result = authenticationController.firstLoginView(req);

      // assertion
      expect(result.csrfToken).toEqual('mygreatcsrftoken');
    });
  });

  describe('firstLogin', () => {
    it('should log in the user, log the action, then redirect to the app root', () => {
      // setup
      const req = {
        params: {
          token: 'the fantastic token !',
        },
        user: {
          username: 'foo',
        },
      };

      const res = {
        redirect: jest.fn(),
        locals: {
          APP_ROOT: '/foo/bar',
        },
      };

      // action
      authenticationController.firstLogin(req, res);

      // assertion
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/');
      expect(loggerMock.businessEvent).toBeCalledTimes(1);
      expect(loggerMock.businessEvent).toBeCalledWith({
        action: AuthenticationActions.TOKEN_SIGNUP,
        state: AuthenticationStates.GRANTED,
        user: req.user.username,
      });
    });
  });

  describe('loginView', () => {
    it('should return the login page with a csrf token', () => {
      // setup
      const req = {
        csrfToken: function csrfToken() {
          return 'mygreatcsrftoken';
        },
      };

      // action
      const result = authenticationController.loginView(req);

      // assertion
      expect(result.csrfToken).toEqual('mygreatcsrftoken');
    });
  });

  describe('login', () => {
    it('should log in the user, log the action, then redirect to the app root', () => {
      // setup
      const req = {
        user: {
          username: 'foo',
        },
      };

      const res = {
        redirect: jest.fn(),
        locals: {
          APP_ROOT: '/foo/bar',
        },
      };

      // action
      authenticationController.login(req, res);

      // assertion
      expect(loggerMock.businessEvent).toBeCalledTimes(1);
      expect(loggerMock.businessEvent).toBeCalledWith({
        action: AuthenticationActions.SIGNIN,
        state: AuthenticationStates.GRANTED,
        user: req.user.username,
      });
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/');
    });
  });

  describe('logout method', () => {
    it('logs out the user and redirects to the homepage', async () => {
      // setup
      /**
       * Mock the call to callback function
       * to make the promisified function resolve
       */
      const promisiableImplementation = (cb: () => void) => cb();
      const req = {
        logout: jest.fn(),
        user: {
          username: 'foo',
        },
        session: {
          regenerate: jest.fn().mockImplementation(promisiableImplementation),
          destroy: jest.fn().mockImplementation(promisiableImplementation),
        },
      };
      const res = {
        redirect: jest.fn(),
        locals: {
          APP_ROOT: '/foo/bar',
        },
      };

      // action
      await authenticationController.logout(req, res);

      // assert
      expect(loggerMock.businessEvent).toBeCalledWith({
        action: AuthenticationActions.SIGNOUT,
        user: req.user.username,
      });
      expect(req.logout).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/login');
    });
  });
});
