import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { OidcProviderService } from '@fc/oidc-provider';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from './core-fcp.service';

describe('CoreFcpController', () => {
  let coreFcpController: CoreFcpController;

  const interactionDetailsResolved = {
    uid: Symbol('uid'),
    prompt: Symbol('prompt'),
    params: {},
  };
  const interactionFinishedValue = Symbol('interactionFinishedValue');
  const providerMock = {
    interactionDetails: jest.fn(),
    interactionFinished: jest.fn(),
  };

  const oidcProviderServiceMock = {
    getInteraction: jest.fn(),
    finishInteraction: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  } as unknown) as LoggerService;

  const coreFcpServiceMock = {
    getConsent: jest.fn(),
  };

  const identityProviderServiceMock = {
    getList: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreFcpController],
      providers: [
        LoggerService,
        OidcProviderService,
        CoreFcpService,
        IdentityProviderService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(CoreFcpService)
      .useValue(coreFcpServiceMock)
      .overrideProvider(IdentityProviderService)
      .useValue(identityProviderServiceMock)
      .compile();

    coreFcpController = await app.get<CoreFcpController>(CoreFcpController);

    jest.resetAllMocks();
    providerMock.interactionDetails.mockResolvedValue(
      interactionDetailsResolved,
    );
    oidcProviderServiceMock.finishInteraction.mockReturnValue(
      interactionFinishedValue,
    );
    oidcProviderServiceMock.getInteraction.mockReturnValue(providerMock);
    coreFcpServiceMock.getConsent.mockResolvedValue(interactionDetailsResolved);
  });

  describe('getInteraction', () => {
    it('should return uid', async () => {
      // Given
      const req = {
        session: { uid: 42 },
      };
      const res = {};
      oidcProviderServiceMock.getInteraction.mockResolvedValue({
        uid: 'uid',
        prompt: 'prompt',
        params: 'params',
      });
      // When
      const result = await coreFcpController.getInteraction(req, res);
      // Then
      expect(result).toHaveProperty('uid');
    });
  });

  describe('getConsent', () => {
    it('should call coreFcpService', async () => {
      // Given
      const req = {
        session: { uid: 42, user: {} },
      };
      const res = {};
      // When
      await coreFcpController.getConsent(req, res);
      // Then
      expect(coreFcpServiceMock.getConsent).toHaveBeenCalledTimes(1);
    });
    it('should return an object', async () => {
      // Given
      const req = {
        session: { uid: 42, user: {} },
      };
      const res = {};
      // When
      const result = await coreFcpController.getConsent(req, res);
      // Then
      expect(result).toEqual(
        expect.objectContaining(interactionDetailsResolved),
      );
    });
  });

  describe('getLogin', () => {
    it('should call interactionFinished', async () => {
      // Given
      const req = {
        session: { uid: 42 },
        body: { acr: 'acr' },
      };
      const res = {};
      // When
      await coreFcpController.getLogin(req, res);
      // Then
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledTimes(
        1,
      );
    });
    it('should return an object', async () => {
      // Given
      const req = {
        session: { uid: 42 },
        body: { acr: 'acr' },
      };
      const res = {};
      // When
      const result = await coreFcpController.getLogin(req, res);
      // Then
      expect(result).toBe(interactionFinishedValue);
    });
  });
});
