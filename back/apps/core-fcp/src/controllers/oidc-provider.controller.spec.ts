import { Test, TestingModule } from '@nestjs/testing';
import { OidcProviderController } from './oidc-provider.controller';
import { AuthorizeParamsDTO } from '../dto';

describe('OidcProviderController', () => {
  let oidcProviderController: OidcProviderController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OidcProviderController],
    }).compile();

    oidcProviderController = await app.get<OidcProviderController>(
      OidcProviderController,
    );

    jest.resetAllMocks();
  });

  describe('getAuthorize', () => {
    it('should call next', () => {
      // Given
      const nextMock = jest.fn();
      const queryMock = {} as AuthorizeParamsDTO;
      // When
      oidcProviderController.getAuthorize(nextMock, queryMock);
      // Then
      expect(nextMock).toHaveReturnedTimes(1);
    });
  });

  describe('postAuthorize', () => {
    it('should call next', () => {
      // Given
      const nextMock = jest.fn();
      const bodyMock = {} as AuthorizeParamsDTO;
      // When
      oidcProviderController.postAuthorize(nextMock, bodyMock);
      // Then
      expect(nextMock).toHaveReturnedTimes(1);
    });
  });
});
