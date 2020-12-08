import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { EidasProviderController } from './eidas-provider.controller';
import { EidasProviderService } from './eidas-provider.service';

describe('EidasProviderController', () => {
  let controller: EidasProviderController;

  const configMock = {
    proxyServiceResponseCacheUrl: 'proxyServiceResponseCacheUrl',
    redirectAfterRequestHandlingUrl: 'redirectAfterRequestHandlingUrl',
  };
  const configServiceMock = {
    get: jest.fn(),
  };

  const eidasProviderServiceMock = {
    prepareLightResponse: jest.fn(),
    writeLightResponseInCache: jest.fn(),
    readLightRequestFromCache: jest.fn(),
    parseLightRequest: jest.fn(),
    completeFcSuccessResponse: jest.fn(),
    completeFcFailureResponse: jest.fn(),
  };

  const exposedSessionMock = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const eidasRequestMock = {
    id: 'id',
    relayState: 'relayState',
    levelOfAssurance: 'levelOfAssurance',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EidasProviderController],
      providers: [ConfigService, EidasProviderService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(EidasProviderService)
      .useValue(eidasProviderServiceMock)
      .compile();

    controller = module.get<EidasProviderController>(EidasProviderController);

    configServiceMock.get.mockReturnValueOnce(configMock);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * :warning: This is a temporary controller, the tests should change with the integration
   * of the FranceConnect openid cinematic
   */
  describe('requestHandler', () => {
    const body = {
      token:
        'VGhlIExvc3QgQmF0dGFsaW9uIGlzIHRoZSBuYW1lIGdpdmVuIHRvIG5pbmUgY29tcGFuaWVzIG9mIHRoZSBVbml0ZWQgU3RhdGVzIDc3OnRoIERpdmlzaW9uIGR1cmluZyB0aGUgYmF0dGxlIG9mIHRoZSBBcmdvbm5lIGluIDE5MTgu',
    };

    const lightRequestMock =
      "<LightRequest>If you believe, you'll see</LightRequest>";

    beforeEach(() => {
      eidasProviderServiceMock.readLightRequestFromCache.mockResolvedValueOnce(
        lightRequestMock,
      );
      eidasProviderServiceMock.parseLightRequest.mockReturnValueOnce(
        eidasRequestMock,
      );
    });

    it('should read the light-request corresponding to the token in the body from the cache', async () => {
      // action
      await controller.requestHandler(body, exposedSessionMock);

      // expect
      expect(
        eidasProviderServiceMock.readLightRequestFromCache,
      ).toHaveBeenCalledTimes(1);
      expect(
        eidasProviderServiceMock.readLightRequestFromCache,
      ).toHaveBeenCalledWith(body.token);
    });

    it('should parse the light-request', async () => {
      // action
      await controller.requestHandler(body, exposedSessionMock);

      // expect
      expect(eidasProviderServiceMock.parseLightRequest).toHaveBeenCalledTimes(
        1,
      );
      expect(eidasProviderServiceMock.parseLightRequest).toHaveBeenCalledWith(
        lightRequestMock,
      );
    });

    it('should put the eidas request in session', async () => {
      // action
      await controller.requestHandler(body, exposedSessionMock);

      // expect
      expect(exposedSessionMock.set).toHaveBeenCalledTimes(1);
      expect(exposedSessionMock.set).toHaveBeenCalledWith(
        'eidasRequest',
        eidasRequestMock,
      );
    });

    it('should retrieve the redirectAfterRequestHandlingUrl from the config', async () => {
      // action
      await controller.requestHandler(body, exposedSessionMock);

      // expect
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('EidasProvider');
    });

    it('should return the redirectAfterRequestHandlingUrl with a 302 statusCode', async () => {
      // setup
      const expected = {
        url: configMock.redirectAfterRequestHandlingUrl,
        statusCode: 302,
      };

      // action
      const result = await controller.requestHandler(body, exposedSessionMock);

      // expect
      expect(result).toStrictEqual(expected);
    });
  });

  describe('responseProxy', () => {
    const partialEidasResponseMock = {
      status: {
        failure: false,
      },
    };
    const getEidasSessionMock = jest.fn();
    const eidasResponseMock = {
      id: '42691337',
      ...partialEidasResponseMock,
    };
    const formattedLightResponseMock = {
      token: 'IlNhYmF0b24gLSBUaGUgTG9zdCBCYXR0YWxpb24iIC0+IExpc3Rlbg==',
      lightResponse:
        "<LightResponse>If you believe, you'll see</LightResponse>",
    };

    beforeEach(() => {
      controller[
        'getEidasResponse'
      ] = getEidasSessionMock.mockResolvedValueOnce(eidasResponseMock);

      eidasProviderServiceMock.prepareLightResponse.mockReturnValueOnce(
        formattedLightResponseMock,
      );
    });

    it('should get the proxyServiceResponseCacheUrl from the configuration', async () => {
      // action
      await controller.responseProxy(exposedSessionMock);

      // expect
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('EidasProvider');
    });

    it('should prepare the light response using the eidasReponse', async () => {
      // action
      await controller.responseProxy(exposedSessionMock);

      // expect
      expect(
        eidasProviderServiceMock.prepareLightResponse,
      ).toHaveBeenCalledTimes(1);
      expect(
        eidasProviderServiceMock.prepareLightResponse,
      ).toHaveBeenCalledWith(eidasResponseMock);
    });

    it('should write the light-response to the cache', async () => {
      // action
      await controller.responseProxy(exposedSessionMock);

      // expect
      expect(
        eidasProviderServiceMock.writeLightResponseInCache,
      ).toHaveBeenCalledTimes(1);
      expect(
        eidasProviderServiceMock.writeLightResponseInCache,
      ).toHaveBeenCalledWith(
        eidasResponseMock.id,
        formattedLightResponseMock.lightResponse,
      );
    });

    it('should return the proxyServiceResponseCacheUrl and the token corresponding to the ligh-response', async () => {
      // action
      const expected = {
        proxyServiceResponseCacheUrl: configMock.proxyServiceResponseCacheUrl,
        token: formattedLightResponseMock.token,
      };
      const result = await controller.responseProxy(exposedSessionMock);

      // expect
      expect(result).toStrictEqual(expected);
    });
  });

  describe('getEidasResponse', () => {
    const partialEidasResponseMock = {
      status: {
        failure: false,
      },
    };

    beforeEach(() => {
      exposedSessionMock.get.mockResolvedValueOnce({
        eidasRequest: eidasRequestMock,
        partialEidasResponse: partialEidasResponseMock,
      });
    });

    it('should get the eidas request and the partial eidas response from the session', async () => {
      // action
      await controller['getEidasResponse'](exposedSessionMock);

      // expect
      expect(exposedSessionMock.get).toHaveBeenCalledTimes(1);
      expect(exposedSessionMock.get).toHaveBeenCalledWith();
    });

    it('should call completeFcSuccessResponse with the partialEidasResponse and the eidasRequest if the status failure is false', async () => {
      // action
      await controller['getEidasResponse'](exposedSessionMock);

      // expect
      expect(
        eidasProviderServiceMock.completeFcSuccessResponse,
      ).toHaveBeenCalledTimes(1);
      expect(
        eidasProviderServiceMock.completeFcSuccessResponse,
      ).toHaveBeenCalledWith(partialEidasResponseMock, eidasRequestMock);
    });

    it('should call completeFcFailureResponse with the partialEidasResponse and the eidasRequest if the status failure is true', async () => {
      // setup
      const partialFailureEidasResponseMock = {
        status: {
          failure: true,
        },
      };
      exposedSessionMock.get.mockReset().mockResolvedValueOnce({
        eidasRequest: eidasRequestMock,
        partialEidasResponse: partialFailureEidasResponseMock,
      });
      const eidasFailureResponseMock = {
        id: '42691337',
        ...partialFailureEidasResponseMock,
      };
      eidasProviderServiceMock.completeFcFailureResponse.mockReturnValueOnce(
        eidasFailureResponseMock,
      );

      // action
      await controller['getEidasResponse'](exposedSessionMock);

      // expect
      expect(
        eidasProviderServiceMock.completeFcFailureResponse,
      ).toHaveBeenCalledTimes(1);
      expect(
        eidasProviderServiceMock.completeFcFailureResponse,
      ).toHaveBeenCalledWith(partialFailureEidasResponseMock, eidasRequestMock);
    });
  });
});
