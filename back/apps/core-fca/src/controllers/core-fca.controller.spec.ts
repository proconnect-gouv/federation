import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { ServiceProviderService } from '@fc/service-provider';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { CoreMissingIdentity } from '@fc/core';
import { MinistriesService } from '@fc/ministries';
import { CoreFcaService } from '../services';
import { CoreFcaController } from './core-fca.controller';

describe('CoreFcaController', () => {
  let coreController: CoreFcaController;

  const params = { uid: 'abcdefghijklmnopqrstuvwxyz0123456789' };
  const interactionIdMock = 'interactionIdMockValue';
  const acrMock = 'acrMockValue';
  const spNameMock = 'some SP';

  const interactionDetailsResolved = {
    uid: Symbol('uid'),
    prompt: Symbol('prompt'),
    params: {
      scope: 'toto titi',
    },
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

  const coreServiceMock = {
    getConsent: jest.fn(),
    sendAuthenticationMail: jest.fn(),
    verify: jest.fn(),
  };

  const ministriesServiceMock = {
    getList: jest.fn(),
  };

  const identityProviderServiceMock = {
    getList: jest.fn(),
    getFilteredList: jest.fn(),
  };

  const serviceProviderServiceMock = {
    getById: jest.fn(),
  };

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
  };

  const randomStringMock = 'randomStringMockValue';
  const cryptographyServiceMock = {
    genRandomString: jest.fn(),
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };
  const configServiceMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreFcaController],
      providers: [
        LoggerService,
        OidcProviderService,
        MinistriesService,
        CoreFcaService,
        IdentityProviderService,
        ServiceProviderService,
        SessionService,
        ConfigService,
        CryptographyService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(MinistriesService)
      .useValue(ministriesServiceMock)
      .overrideProvider(CoreFcaService)
      .useValue(coreServiceMock)
      .overrideProvider(IdentityProviderService)
      .useValue(identityProviderServiceMock)
      .overrideProvider(ServiceProviderService)
      .useValue(serviceProviderServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .compile();

    coreController = await app.get<CoreFcaController>(CoreFcaController);

    jest.resetAllMocks();
    providerMock.interactionDetails.mockResolvedValue(
      interactionDetailsResolved,
    );
    oidcProviderServiceMock.finishInteraction.mockReturnValue(
      interactionFinishedValue,
    );
    oidcProviderServiceMock.getInteraction.mockResolvedValue(
      interactionDetailsResolved,
    );
    coreServiceMock.verify.mockResolvedValue(interactionDetailsResolved);
    serviceProviderServiceMock.getById.mockResolvedValue({
      name: spNameMock,
    });
    sessionServiceMock.get.mockResolvedValue({
      interactionId: interactionIdMock,
      spAcr: acrMock,
      spIdentity: {},
      spName: spNameMock,
      csrfToken: randomStringMock,
    });
    sessionServiceMock.patch.mockResolvedValueOnce(undefined);
    cryptographyServiceMock.genRandomString.mockReturnValue(randomStringMock);
    configServiceMock.get.mockReturnValue(appConfigMock);
  });

  describe('getDefault', () => {
    it('should redirect to configured url', () => {
      // Given
      const configuredValueMock = 'fooBar';
      configServiceMock.get.mockReturnValue({
        defaultRedirectUri: configuredValueMock,
      });
      const resMock = {
        redirect: jest.fn(),
      };
      // When
      coreController.getDefault(resMock);
      // Then
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('Core');
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(resMock.redirect).toHaveBeenCalledWith(301, configuredValueMock);
    });
  });

  describe('getFrontData', () => {
    // Given
    const req = {
      fc: {
        interactionId: 'interactionIdMock',
      },
    };
    const res = {
      json: jest.fn(),
    };
    const idps = [
      { active: true, display: true, title: 'toto', uid: '12345' },
      { active: true, display: true, title: 'tata', uid: '12354' },
    ];
    const ministries = [
      {
        id: 'mock-ministry-id',
        name: 'mocked ministry',
        identityProviders: ['12345'],
      },
    ];

    beforeEach(() => {
      oidcProviderServiceMock.getInteraction.mockResolvedValueOnce({
        params: {
          // Oidc name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          acr_values: 'eidas2',
          // Oidc name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          redirect_uri: 'https://youre-redirected',
          // Oidc name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          response_type: 'success',
        },
      });

      ministriesServiceMock.getList.mockResolvedValueOnce(ministries);
      identityProviderServiceMock.getFilteredList.mockResolvedValueOnce(idps);
    });

    it('should call oidcProvider.getInteraction', async () => {
      // Given
      jest.spyOn(oidcProviderServiceMock, 'getInteraction');
      // When
      await coreController.getFrontData(req, res);

      // Then
      expect(oidcProviderServiceMock.getInteraction).toHaveBeenCalledTimes(1);
      expect(oidcProviderServiceMock.getInteraction).toHaveBeenCalledWith(
        req,
        res,
      );
    });
    it('should call config.get', async () => {
      // Given
      jest.spyOn(configServiceMock, 'get');
      // When
      await coreController.getFrontData(req, res);

      // Then
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('OidcClient');
    });
    it('should call identityProviderGetFilteredList', async () => {
      // When
      await coreController.getFrontData(req, res);

      // Then
      expect(identityProviderServiceMock.getFilteredList).toHaveBeenCalledTimes(
        1,
      );
    });
    it('should call session.get', async () => {
      // When
      await coreController.getFrontData(req, res);

      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.get).toHaveBeenCalledWith(req.fc.interactionId);
    });
    it('should call res.json', async () => {
      // When
      await coreController.getFrontData(req, res);

      // Then
      expect(res.json).toHaveBeenCalledTimes(1);
    });
    it('should return object containing needed data', async () => {
      // When
      await coreController.getFrontData(req, res);
      // Then
      const expected = expect.objectContaining({
        redirectToIdentityProviderInputs: expect.any(Object),
        redirectURL: expect.any(String),
        ministries: expect.any(Array),
        identityProviders: expect.any(Array),
        serviceProviderName: expect.any(String),
      });
      expect(res.json).toHaveBeenCalledWith(expected);
    });
  });

  describe('getInteraction', () => {
    it('should return empty object', async () => {
      // Given
      oidcProviderServiceMock.getInteraction.mockResolvedValue({
        uid: 'uid',
        prompt: 'prompt',
        params: 'params',
      });
      // When
      const result = await coreController.getInteraction();
      // Then
      expect(result).toEqual({});
    });
  });

  describe('getVerify', () => {
    it('should call coreService', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {
        redirect: jest.fn(),
      };
      // When
      await coreController.getVerify(req, res, params);
      // Then
      expect(coreServiceMock.verify).toHaveBeenCalledTimes(1);
    });
    it('should redirect to /login URL', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {
        redirect: jest.fn(),
      };
      // When
      await coreController.getVerify(req, res, params);
      // Then
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(`/api/v2/login`);
    });
  });

  describe('getLogin', () => {
    it('should throw an exception if no identity in session', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const next = jest.fn();
      sessionServiceMock.get.mockResolvedValue({
        interactionId: interactionIdMock,
        spAcr: acrMock,
        spName: spNameMock,
        csrfToken: randomStringMock,
      });
      // Then
      expect(coreController.getLogin(req, next)).rejects.toThrow(
        CoreMissingIdentity,
      );
    });

    it('should call next', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      // When
      await coreController.getLogin(req, res);
      // Then
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledWith(
        req,
        res,
      );
    });
    it('should return result from controller.oidcProvider.finishInteraction()', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      // When
      const result = await coreController.getLogin(req, res);
      // Then
      expect(result).toBe(interactionFinishedValue);
    });
  });
});
