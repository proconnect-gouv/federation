import { ConfigService } from '@fc/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EidasProviderController } from './eidas-provider.controller';
import { EidasProviderService } from './eidas-provider.service';

describe('EidasProviderController', () => {
  let controller: EidasProviderController;

  const configServiceMock = {
    get: jest.fn(),
  };

  const eidasProviderServiceMock = {
    prepareLightResponse: jest.fn(),
    writeLightResponseInCache: jest.fn(),
    readLightRequestFromCache: jest.fn(),
    parseLightRequest: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * :warning: This is a temporary controller, the tests should change with the integration
   * of the FranceConnect openid cinematic
   */
  describe('callback', () => {
    const body = {
      token:
        'VGhlIExvc3QgQmF0dGFsaW9uIGlzIHRoZSBuYW1lIGdpdmVuIHRvIG5pbmUgY29tcGFuaWVzIG9mIHRoZSBVbml0ZWQgU3RhdGVzIDc3OnRoIERpdmlzaW9uIGR1cmluZyB0aGUgYmF0dGxlIG9mIHRoZSBBcmdvbm5lIGluIDE5MTgu',
    };

    const formattedLightResponseMock = {
      token: 'IlNhYmF0b24gLSBUaGUgTG9zdCBCYXR0YWxpb24iIC0+IExpc3Rlbg==',
      lightResponse:
        "<LightResponse>If you believe, you'll see</LightResponse>",
    };

    const requestMock = {
      id: 'id',
      relayState: 'relayState',
      levelOfAssurance: 'levelOfAssurance',
    };

    const hardcodedIdentityMock = {
      id: expect.any(String),
      inResponseToId: requestMock.id,
      issuer: 'EIDASBridge ProxyService',
      ipAddress: '127.0.0.1',
      relayState: requestMock.relayState,
      subject:
        '9043a641bacfb18418b571e6d31fabd32307998aeebfb323175e34f81d62351cv1',
      subjectNameIdFormat: 'unspecified',
      levelOfAssurance: requestMock.levelOfAssurance,
      status: {
        failure: 'false',
        statusCode: 'Success',
        statusMessage: 'Hello there :)',
      },
      attributes: {
        personIdentifier:
          'FR/BE/9043a641bacfb18418b571e6d31fabd32307998aeebfb323175e34f81d62351cv1',
        currentFamilyName: 'DUBOIS',
        currentGivenName: ['Angela', 'Claire', 'Louise'],
        dateOfBirth: '1962-08-24',
        currentAddress: {
          poBox: '1234',
          locatorDesignator: '20',
          locatorName: 'Ségur Fontenoy',
          cvaddressArea: 'Paris',
          thoroughfare: 'Avenue de Ségur',
          postName: 'PARIS 7',
          adminunitFirstline: 'FR',
          adminunitSecondline: 'PARIS',
          postCode: '75107',
        },
        gender: 'Female',
        birthName: 'DUBOIS',
        placeOfBirth: '75107',
      },
    };

    const configMock = {
      proxyServiceResponseCacheUrl: 'proxyServiceResponseCacheUrl',
    };

    const lightRequestMock =
      "<LightRequest>If you believe, you'll see</LightRequest>";

    beforeEach(() => {
      eidasProviderServiceMock.readLightRequestFromCache.mockResolvedValueOnce(
        lightRequestMock,
      );
      eidasProviderServiceMock.parseLightRequest.mockReturnValueOnce(
        requestMock,
      );
      eidasProviderServiceMock.prepareLightResponse.mockReturnValueOnce(
        formattedLightResponseMock,
      );
      configServiceMock.get.mockReturnValueOnce(configMock);
    });

    it('should read the light-request corresponding to the token in the body from the cache', async () => {
      // action
      await controller.callback(body);

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
      await controller.callback(body);

      // expect
      expect(eidasProviderServiceMock.parseLightRequest).toHaveBeenCalledTimes(
        1,
      );
      expect(eidasProviderServiceMock.parseLightRequest).toHaveBeenCalledWith(
        lightRequestMock,
      );
    });

    it('should format the temporary hardcoded identity as a light-response', async () => {
      // action
      await controller.callback(body);

      // expect
      expect(
        eidasProviderServiceMock.prepareLightResponse,
      ).toHaveBeenCalledTimes(1);
      expect(
        eidasProviderServiceMock.prepareLightResponse,
      ).toHaveBeenCalledWith(hardcodedIdentityMock);
    });

    it('should get the proxyServiceResponseCacheUrl from the configuration', async () => {
      // action
      await controller.callback(body);

      // expect
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('EidasProvider');
    });

    it('should write the light-response to the cache', async () => {
      // action
      await controller.callback(body);

      // expect
      expect(
        eidasProviderServiceMock.writeLightResponseInCache,
      ).toHaveBeenCalledTimes(1);
      expect(
        eidasProviderServiceMock.writeLightResponseInCache,
      ).toHaveBeenCalledWith(
        hardcodedIdentityMock.id,
        formattedLightResponseMock.lightResponse,
      );
    });

    it('should return the proxyServiceResponseCacheUrl and the token corresponding to the ligh-response', async () => {
      // action
      const expected = {
        proxyServiceResponseCacheUrl: configMock.proxyServiceResponseCacheUrl,
        token: formattedLightResponseMock.token,
      };
      const result = await controller.callback(body);

      // expect
      expect(result).toStrictEqual(expected);
    });
  });
});
