import { validate } from 'class-validator';

import { ExecutionContext } from '@nestjs/common';

import { NestJsDependencyInjectionWrapper } from '@fc/common';
import { SessionInvalidSessionException } from '@fc/session';

import { UserSessionDecoratorFactory } from './user-session.decorator';

jest.mock('class-validator', () => ({
  ...(jest.requireActual('class-validator') as any),
  validate: jest.fn(),
}));

/**
 * Test suite for the UserSessionDecorator.
 *
 * This decorator:
 * - Retrieves a SessionService instance from the NestJsDependencyInjectionWrapper.
 * - Binds session methods (get, set, commit, duplicate, reset, destroy) to the 'User' module.
 * - Validates the session data against an optional mandatory DTO as well as the UserSession DTO.
 * - Throws a SessionInvalidSessionException when validation errors occur.
 */
describe('UserSessionDecoratorFactory', () => {
  let fakeResponse: Record<string, unknown>;
  let fakeExecutionContext: ExecutionContext;
  let fakeSessionService: any;
  const validSessionData = { dummy: 'value', user: 'test' };

  beforeEach(() => {
    jest.resetAllMocks();

    // Create a fake response object.
    fakeResponse = {};

    // Create a fake ExecutionContext with a switchToHttp() method.
    fakeExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => fakeResponse,
      }),
    } as unknown as ExecutionContext;

    // Create a fake SessionService with jest mock functions.
    fakeSessionService = {
      get: jest.fn().mockReturnValue(validSessionData),
      set: jest.fn(),
      commit: jest.fn(),
      duplicate: jest.fn().mockReturnValue('duplicatedSession'),
      reset: jest.fn(),
      destroy: jest.fn(),
    };

    // Stub NestJsDependencyInjectionWrapper.get to return our fake session service.
    jest
      .spyOn(NestJsDependencyInjectionWrapper, 'get')
      .mockReturnValue(fakeSessionService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return the bound session service with all methods when validations pass', async () => {
    // Define a dummy DTO for mandatory validation.
    class DummyDto {}

    const validateMock = jest.mocked(validate);
    validateMock.mockResolvedValueOnce([]);

    const result = await UserSessionDecoratorFactory(
      DummyDto,
      fakeExecutionContext,
    );

    // Call duplicate and ensure that it calls the underlying sessionService.duplicate with the response.
    const duplicateResult = result.duplicate();
    expect(fakeSessionService.duplicate).toHaveBeenCalledWith(fakeResponse);
    expect(duplicateResult).toBe('duplicatedSession');
  });

  it('should throw SessionInvalidSessionException if a session DTO validation fails', async () => {
    class DummyDto {}
    const validationError = [
      {
        property: 'dummy',
        constraints: { isDefined: 'dummy must be defined' },
      },
    ];

    const validateMock = jest.mocked(validate);
    validateMock.mockResolvedValueOnce(validationError);

    await expect(
      UserSessionDecoratorFactory(DummyDto, fakeExecutionContext),
    ).rejects.toThrowError(SessionInvalidSessionException);

    expect(validateMock).toHaveBeenCalledTimes(1);
  });

  it('should validate only UserSession when no session DTO is provided', async () => {
    const validateMock = jest.mocked(validate);
    validateMock.mockResolvedValueOnce([]);

    const result = await UserSessionDecoratorFactory(
      undefined,
      fakeExecutionContext,
    );
    expect(validateMock).toHaveBeenCalledTimes(1);
    expect(typeof result.get).toBe('function');
  });

  it('should throw SessionInvalidSessionException if UserSession validation fails when no session DTO is provided', async () => {
    const validationError = [
      { property: 'user', constraints: { isDefined: 'user must be defined' } },
    ];

    const validateMock = jest.mocked(validate);
    validateMock.mockResolvedValueOnce(validationError);

    await expect(
      UserSessionDecoratorFactory(undefined, fakeExecutionContext),
    ).rejects.toThrowError(SessionInvalidSessionException);

    expect(validateMock).toHaveBeenCalledTimes(1);
  });
});
