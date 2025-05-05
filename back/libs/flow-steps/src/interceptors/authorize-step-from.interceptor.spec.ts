import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { FlowStepsSession } from '@fc/flow-steps';
import { AuthorizeStepFrom } from '../decorators';
import { SessionNotFoundException, SessionService } from '@fc/session';

import {
  UndefinedStepRouteException,
  UnexpectedNavigationException,
} from '../exceptions';
import { AuthorizeStepFromInterceptor } from './authorize-step-from.interceptor';

describe('AuthorizeStepFromInterceptor', () => {
  let interceptor: AuthorizeStepFromInterceptor;

  const configServiceMock = { get: jest.fn() };
  const reflectorMock = {};
  const sessionServiceMock = { get: jest.fn() };

  const httpContextMock = { getRequest: jest.fn() };
  const reqMock = { route: { path: '/prefix/some-route' } };
  const contextMock = {
    switchToHttp: () => httpContextMock,
  } as unknown as ExecutionContext;
  const nextMock = { handle: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizeStepFromInterceptor,
        ConfigService,
        Reflector,
        SessionService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(Reflector)
      .useValue(reflectorMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .compile();

    interceptor = module.get<AuthorizeStepFromInterceptor>(
      AuthorizeStepFromInterceptor,
    );

    // Default mocks
    configServiceMock.get.mockReturnValue({ urlPrefix: '/prefix' });
    httpContextMock.getRequest.mockReturnValue(reqMock);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should retrieve routes from AuthorizeStepFrom decorator', () => {
      // Arrange
      const routes: string[] = [];
      jest.spyOn(AuthorizeStepFrom, 'get').mockReturnValue(routes);

      // Act
      interceptor.intercept(contextMock, nextMock);

      // Assert
      expect(AuthorizeStepFrom.get).toHaveBeenCalledTimes(1);
      expect(AuthorizeStepFrom.get).toHaveBeenCalledWith(
        reflectorMock,
        contextMock,
      );
    });

    describe('when routes are empty', () => {
      beforeEach(() => {
        jest.spyOn(AuthorizeStepFrom, 'get').mockReturnValue([]);
      });

      it('should return the result from next.handle()', () => {
        // Arrange
        const handleResultMock = Symbol('handleResult');
        nextMock.handle.mockReturnValue(handleResultMock);

        // Act
        const result = interceptor.intercept(contextMock, nextMock);

        // Assert
        expect(result).toBe(handleResultMock);
      });
    });

    describe('when routes are not empty', () => {
      const routes = ['allowedRoute'];

      beforeEach(() => {
        jest.spyOn(AuthorizeStepFrom, 'get').mockReturnValue(routes);
      });

      it('should throw SessionNotFoundException if session data is empty', () => {
        // Arrange
        sessionServiceMock.get.mockReturnValue(null);

        // Act & Assert
        expect(() => interceptor.intercept(contextMock, nextMock)).toThrow(
          SessionNotFoundException,
        );
      });

      it('should throw UndefinedStepRouteException if previousRoute is not defined', () => {
        // Arrange: session data exists but without previousRoute
        sessionServiceMock.get.mockReturnValue({ randomKey: 'randomValue' });

        // Act & Assert
        expect(() => interceptor.intercept(contextMock, nextMock)).toThrow(
          UndefinedStepRouteException,
        );
      });

      it('should throw UnexpectedNavigationException if previousRoute is not allowed', () => {
        // Arrange: previousRoute exists but is not in the allowed routes
        const sessionData: FlowStepsSession = {
          previousRoute: 'notAllowedRoute',
        } as any;
        sessionServiceMock.get.mockReturnValue(sessionData);
        // currentRoute is computed from reqMock:
        // '/prefix/some-route' with urlPrefix '/prefix' becomes '/some-route'

        // Act & Assert
        expect(() => interceptor.intercept(contextMock, nextMock)).toThrow(
          UnexpectedNavigationException,
        );
        try {
          interceptor.intercept(contextMock, nextMock);
        } catch (error) {
          expect(error.message).toBe(
            `Navigation from notAllowedRoute to /some-route is not allowed. Allowed origins are: ${routes.join(', ')}.`,
          );
        }
      });

      it('should return next.handle() if previousRoute is allowed', () => {
        // Arrange: previousRoute is in the allowed routes
        const sessionData: FlowStepsSession = {
          previousRoute: 'allowedRoute',
        } as any;
        sessionServiceMock.get.mockReturnValue(sessionData);
        const handleResultMock = Symbol('handleResult');
        nextMock.handle.mockReturnValue(handleResultMock);

        // Act
        const result = interceptor.intercept(contextMock, nextMock);

        // Assert
        expect(result).toBe(handleResultMock);
      });
    });
  });
});
