import { KoaContextWithOIDC, Provider } from 'oidc-provider';

import { Test, TestingModule } from '@nestjs/testing';

import { throwException } from '@fc/exceptions/helpers';
import { LoggerService } from '@fc/logger';

import { getLoggerMock } from '@mocks/logger';

import { OidcProviderErrorService } from './oidc-provider-error.service';

jest.mock('@fc/exceptions/helpers', () => ({
  ...jest.requireActual('@fc/exceptions/helpers'),
  throwException: jest.fn(),
}));

describe('OidcProviderErrorService', () => {
  let service: OidcProviderErrorService;

  const loggerServiceMock = getLoggerMock();

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [OidcProviderErrorService, LoggerService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<OidcProviderErrorService>(OidcProviderErrorService);
  });

  describe('catchErrorEvents', () => {
    it('should call register event for each error case', () => {
      // Given
      const EVENT_COUNT = 17;
      const provider = { on: jest.fn() as unknown } as Provider;
      // When
      service.catchErrorEvents(provider);
      // Then
      expect(provider.on).toHaveBeenCalledTimes(EVENT_COUNT);
    });
  });

  describe('listenError', () => {
    it('should call renderError', async () => {
      // Given
      service.renderError = jest.fn();
      const ctx = {} as KoaContextWithOIDC;
      const error = new Error('error');
      const eventName = 'event';

      // When
      await service.listenError(eventName, ctx, error);

      // Then
      expect(service.renderError).toHaveBeenCalledTimes(1);
    });
  });

  describe('renderError', () => {
    it('should set isError flag on ctx.oidc', async () => {
      // Given
      const ctx = { oidc: {} } as KoaContextWithOIDC;
      const error = new Error('error');
      // When
      await service.renderError(ctx, '', error);
      // Then
      expect(ctx.oidc).toHaveProperty('isError', true);
    });

    it('should call throwException', async () => {
      // Given
      const ctx = {} as KoaContextWithOIDC;
      const error = new Error('error');
      // When
      await service.renderError(ctx, '', error);
      // Then
      expect(throwException).toHaveBeenCalledTimes(1);
    });
  });
});
