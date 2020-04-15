import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';
import { CoreFcpController } from './core-fcp.controller';

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
    getProvider: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  } as unknown) as LoggerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreFcpController],
      providers: [LoggerService, OidcProviderService],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    coreFcpController = await app.get<CoreFcpController>(CoreFcpController);

    jest.resetAllMocks();
    providerMock.interactionDetails.mockResolvedValue(
      interactionDetailsResolved,
    );
    providerMock.interactionFinished.mockReturnValue(interactionFinishedValue);
    oidcProviderServiceMock.getProvider.mockReturnValue(providerMock);
  });

  describe('getInteraction', () => {
    it('should return uid', async () => {
      // Given
      const req = {
        session: { uid: 42 },
      };
      const res = {};
      providerMock.interactionDetails.mockResolvedValue({
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
    it('should call interactionDetails', async () => {
      // Given
      const req = {
        session: { uid: 42, user: {} },
      };
      const res = {};
      // When
      await coreFcpController.getConsent(req, res);
      // Then
      expect(oidcProviderServiceMock.getProvider).toHaveBeenCalledTimes(1);
      expect(providerMock.interactionDetails).toHaveBeenCalledTimes(1);
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
      expect(oidcProviderServiceMock.getProvider).toHaveBeenCalledTimes(1);
      expect(providerMock.interactionFinished).toHaveBeenCalledTimes(1);
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
