import { tap } from 'rxjs';

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { AppConfig } from '@fc/app';
import { ConfigService } from '@fc/config';
import { SessionService } from '@fc/session';

import { getSessionServiceMock } from '@mocks/session';

import { SetStep } from '../decorators';
import { SetStepInterceptor } from './set-step.interceptor';

jest.mock('@fc/session/helper', () => ({
  SessionService: jest.fn(),
}));

jest.mock('../decorators', () => ({
  IsStep: jest.fn(),
}));

jest.mock('rxjs', () => ({
  tap: jest.fn(),
}));

describe('IsStepInterceptor', () => {
  let interceptor: SetStepInterceptor;

  const sessionServiceMock = {
    setStep: jest.fn(),
  };

  const httpContextMock = {
    getRequest: jest.fn(),
  };

  const reqMock = {
    route: {
      path: '/a/prefix/and/some/uri',
    },
    sessionId: 'sessionIdValue',
  };

  const IsStepMock = jest.mocked(SetStep);

  const tapMock = jest.mocked(tap);

  const contextMock = {
    switchToHttp: () => httpContextMock,
  } as unknown as ExecutionContext;

  const nextMock = {
    handle: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const configMock: Partial<AppConfig> = {
    urlPrefix: '/a/prefix',
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetStepInterceptor,
        ConfigService,
        Reflector,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .compile();

    interceptor = module.get<SetStepInterceptor>(SetStepInterceptor);

    configServiceMock.get.mockReturnValue(configMock);
    httpContextMock.getRequest.mockReturnValue(reqMock);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should retrieve flag from IsStep decorator', () => {
      // Given
      IsStepMock.get = jest.fn().mockReturnValueOnce(false);

      // When
      interceptor.intercept(contextMock, nextMock);

      // Then
      expect(IsStepMock.get).toHaveBeenCalledTimes(1);
    });

    describe('if flag is not set', () => {
      beforeEach(() => {
        IsStepMock.get = jest.fn().mockReturnValueOnce(false);
      });

      it('should return result from next.handle()', () => {
        // Given
        const handleResultMock = Symbol('handleResultMock');
        nextMock.handle.mockReturnValueOnce(handleResultMock);

        // When
        const result = interceptor.intercept(contextMock, nextMock);

        // Then
        expect(result).toBe(handleResultMock);
      });

      it('should not call handle().pipe()', () => {
        // Given
        const handleResultMock = { pipe: jest.fn() };
        nextMock.handle.mockReturnValueOnce(handleResultMock);

        // When
        interceptor.intercept(contextMock, nextMock);

        // Then
        expect(handleResultMock.pipe).not.toHaveBeenCalled();
      });
    });

    describe('if flag is set', () => {
      // Given
      const handleResultMock = { pipe: jest.fn() };

      beforeEach(() => {
        // Given
        nextMock.handle.mockReturnValueOnce(handleResultMock);
        IsStepMock.get = jest.fn().mockReturnValueOnce(true);
      });

      it('should call handle().pipe()', () => {
        // When
        interceptor.intercept(contextMock, nextMock);

        // Then
        expect(handleResultMock.pipe).toHaveBeenCalledTimes(1);
      });

      it('should call tap()', () => {
        // When
        interceptor.intercept(contextMock, nextMock);

        // Then
        expect(tapMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('setStep', () => {
    it('should set stepRoute in session', () => {
      // When
      interceptor['setStep'](contextMock);

      // Then
      expect(flowStepMock.setStep).toHaveBeenCalledTimes(1);
      expect(flowStepMock.setStep).toHaveBeenCalledWith('/and/some/uri');
    });
  });
});
