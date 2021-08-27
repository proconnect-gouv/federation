import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';

import { AuthorizeParamsDto } from '../dto';
import { OidcProviderController } from './oidc-provider.controller';

const loggerServiceMock = {
  setContext: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
} as unknown as LoggerService;

const reqMock = Symbol('req');
const resMock = Symbol('res');
const queryErrorMock = {
  error: 'error',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  error_description: 'errorDescription',
};

describe('OidcProviderController', () => {
  let oidcProviderController: OidcProviderController;

  const oidcProviderServiceMock = {
    abortInteraction: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OidcProviderController],
      providers: [LoggerService, OidcProviderService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .compile();

    oidcProviderController = await app.get<OidcProviderController>(
      OidcProviderController,
    );

    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getAuthorize()', () => {
    it('should call next', () => {
      // Given
      const nextMock = jest.fn();
      const queryMock = {} as AuthorizeParamsDto;
      // When
      oidcProviderController.getAuthorize(nextMock, queryMock);
      // Then
      expect(nextMock).toHaveReturnedTimes(1);
    });
  });

  describe('postAuthorize()', () => {
    it('should call next', () => {
      // Given
      const nextMock = jest.fn();
      const bodyMock = {} as AuthorizeParamsDto;
      // When
      oidcProviderController.postAuthorize(nextMock, bodyMock);
      // Then
      expect(nextMock).toHaveReturnedTimes(1);
    });
  });

  describe('redirectToSpWithError', () => {
    it('should call abortInteraction', async () => {
      // When
      await oidcProviderController.redirectToSpWithError(
        queryErrorMock,
        reqMock,
        resMock,
      );

      // Then
      expect(oidcProviderServiceMock.abortInteraction).toHaveBeenCalledTimes(1);
      expect(oidcProviderServiceMock.abortInteraction).toHaveBeenCalledWith(
        reqMock,
        resMock,
        'error',
        'errorDescription',
      );
    });

    it('should throw an error', async () => {
      // Given
      oidcProviderServiceMock.abortInteraction.mockRejectedValueOnce(
        'Une erreur est survenu.',
      );

      // Then
      await expect(
        oidcProviderController.redirectToSpWithError(
          queryErrorMock,
          reqMock,
          resMock,
        ),
      ).rejects.toThrow(Error);
    });
  });
});
