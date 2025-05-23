import { Test, TestingModule } from '@nestjs/testing';

import { OidcProviderService } from '@fc/oidc-provider';

import { AuthorizeParamsDto } from '../dto';
import { OidcProviderController } from './oidc-provider.controller';

describe('OidcProviderController', () => {
  let oidcProviderController: OidcProviderController;

  const oidcProviderServiceMock = {
    getInteraction: jest.fn(),
    finishInteraction: jest.fn(),
  };

  const interactionFinishedValue = Symbol('interactionFinishedValue');

  const interactionDetailsResolved = {
    params: {
      scope: 'toto titi',
    },
    prompt: Symbol('prompt'),
    uid: Symbol('uid'),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [OidcProviderController],
      providers: [OidcProviderService],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .compile();

    oidcProviderController = app.get<OidcProviderController>(
      OidcProviderController,
    );
    oidcProviderServiceMock.finishInteraction.mockReturnValue(
      interactionFinishedValue,
    );
    oidcProviderServiceMock.getInteraction.mockResolvedValue(
      interactionDetailsResolved,
    );
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
});
