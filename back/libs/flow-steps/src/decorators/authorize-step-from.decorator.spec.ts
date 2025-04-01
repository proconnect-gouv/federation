import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { FLOW_STEP_AUTHORIZE_STEP_FROM_METADATA } from '../tokens';
import { AuthorizeStepFrom } from './authorize-step-from.decorator';

jest.mock('@nestjs/common', () => {
  return {
    ...jest.requireActual('@nestjs/common'),
    SetMetadata: jest.fn(),
  };
});

describe('AuthorizeStepFrom', () => {
  let setMetadataMock: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    setMetadataMock = jest.mocked(SetMetadata);
  });

  it('should set the FLOW_STEP_AUTHORIZE_STEP_FROM_METADATA with the provided routes', () => {
    // Given
    const routes = ['route1', 'route2'];

    // When
    AuthorizeStepFrom(routes);

    // Then
    expect(setMetadataMock).toHaveBeenCalledTimes(1);
    expect(setMetadataMock).toHaveBeenCalledWith(
      FLOW_STEP_AUTHORIZE_STEP_FROM_METADATA,
      routes,
    );
  });
});

describe('AuthorizeStepFrom.get', () => {
  const reflector = { get: jest.fn() } as unknown as Reflector;
  const context = { getHandler: jest.fn() } as unknown as ExecutionContext;

  const routesFlag = ['route1', 'route2'];
  const handlerMock = Symbol('handler') as unknown as Function;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest.mocked(reflector.get).mockReturnValueOnce(routesFlag);
    jest.mocked(context.getHandler).mockReturnValueOnce(handlerMock);
  });

  it('should retrieve the routes from the context', () => {
    // When
    const routes = AuthorizeStepFrom.get(reflector, context);

    // Then
    expect(routes).toBe(routesFlag);
  });

  it('should call context.getHandler exactly once', () => {
    // When
    AuthorizeStepFrom.get(reflector, context);

    // Then
    expect(context.getHandler).toHaveBeenCalledTimes(1);
    expect(context.getHandler).toHaveBeenCalledWith();
  });

  it('should call reflector.get with the correct metadata key and handler', () => {
    // When
    AuthorizeStepFrom.get(reflector, context);

    // Then
    expect(reflector.get).toHaveBeenCalledTimes(1);
    expect(reflector.get).toHaveBeenCalledWith(
      FLOW_STEP_AUTHORIZE_STEP_FROM_METADATA,
      handlerMock,
    );
  });

  it('should return undefined if metadata is not found', () => {
    // Given
    jest.mocked(reflector.get).mockReset().mockReturnValueOnce(undefined);

    // When
    const routes = AuthorizeStepFrom.get(reflector, context);

    // Then
    expect(routes).toBeUndefined();
  });
});
