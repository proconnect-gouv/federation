import { validate } from 'class-validator';

import { ExecutionContext } from '@nestjs/common';

import { NestJsDependencyInjectionWrapper } from '@fc/common';

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

  it('should return the bound session service with all methods when validations pass (with mandatory DTO)', async () => {
    // Define a dummy DTO for mandatory validation.
    class DummyDto {}

    // Simulate no validation errors for both the mandatory DTO and the UserSession.
    const validateMock = jest.mocked(validate);
    validateMock.mockResolvedValueOnce([]); // For validating DummyDto instance.
    validateMock.mockResolvedValueOnce([]); // For validating UserSession instance.

    const result = await UserSessionDecoratorFactory(
      DummyDto,
      fakeExecutionContext,
    );

    // Expect the bound session service to have all expected methods.
    expect(typeof result.get).toBe('function');
    expect(typeof result.set).toBe('function');
    expect(typeof result.commit).toBe('function');
    expect(typeof result.duplicate).toBe('function');
    expect(typeof result.reset).toBe('function');
    expect(typeof result.destroy).toBe('function');

    // Call duplicate and ensure that it calls the underlying sessionService.duplicate with the response.
    const duplicateResult = result.duplicate();
    expect(fakeSessionService.duplicate).toHaveBeenCalledWith(fakeResponse);
    expect(duplicateResult).toBe('duplicatedSession');

    // Call reset and destroy to verify they are bound with the response.
    await result.reset();
    expect(fakeSessionService.reset).toHaveBeenCalledWith(fakeResponse);
    await result.destroy();
    expect(fakeSessionService.destroy).toHaveBeenCalledWith(fakeResponse);

    // Commit is not bound with the response so just check it is called.
    await result.commit();
    expect(fakeSessionService.commit).toHaveBeenCalled();
  });

  it('should throw SessionInvalidSessionException if mandatory DTO validation fails', async () => {
    class DummyDto {}
    const validationError = [
      {
        property: 'dummy',
        constraints: { isDefined: 'dummy must be defined' },
      },
    ];

    // Simulate a validation error for the mandatory DTO.
    const validateMock = jest.mocked(validate);
    validateMock.mockResolvedValueOnce(validationError); // First call (for DummyDto)

    await expect(
      UserSessionDecoratorFactory(DummyDto, fakeExecutionContext),
    ).rejects.toThrowError('UserSessionDecorator: Session data is invalid.');

    expect(validateMock).toHaveBeenCalledTimes(1);
  });

  it('should throw SessionInvalidSessionException if UserSession validation fails', async () => {
    class DummyDto {}
    const validationError = [
      { property: 'user', constraints: { isDefined: 'user must be defined' } },
    ];

    // Simulate successful validation for the mandatory DTO, then a failure for the UserSession.
    const validateMock = jest.mocked(validate);
    validateMock.mockResolvedValueOnce([]); // For DummyDto
    validateMock.mockResolvedValueOnce(validationError); // For UserSession

    await expect(
      UserSessionDecoratorFactory(DummyDto, fakeExecutionContext),
    ).rejects.toThrowError('UserSessionDecorator: Session data is invalid.');

    expect(validateMock).toHaveBeenCalledTimes(2);
  });

  it('should validate only UserSession when no mandatory DTO is provided', async () => {
    // When no mandatory DTO is provided, only one validation (for UserSession) occurs.
    const validateMock = jest.mocked(validate);
    validateMock.mockResolvedValueOnce([]); // For UserSession

    const result = await UserSessionDecoratorFactory(
      undefined,
      fakeExecutionContext,
    );
    expect(validateMock).toHaveBeenCalledTimes(1);
    expect(typeof result.get).toBe('function');
  });

  it('should throw SessionInvalidSessionException if UserSession validation fails when no mandatory DTO is provided', async () => {
    const validationError = [
      { property: 'user', constraints: { isDefined: 'user must be defined' } },
    ];

    // Simulate a validation error for UserSession when no mandatory DTO is provided.
    const validateMock = jest.mocked(validate);
    validateMock.mockResolvedValueOnce(validationError); // For UserSession

    await expect(
      UserSessionDecoratorFactory(undefined, fakeExecutionContext),
    ).rejects.toThrowError('UserSessionDecorator: Session data is invalid.');

    expect(validateMock).toHaveBeenCalledTimes(1);
  });
});
