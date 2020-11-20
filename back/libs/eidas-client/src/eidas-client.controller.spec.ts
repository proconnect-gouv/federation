import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { EidasClientController } from './eidas-client.controller';
import { EidasClientService } from './eidas-client.service';

describe('EidasClientController', () => {
  let controller: EidasClientController;

  const configServiceMock = {
    get: jest.fn(),
  };

  const eidasClientServiceMock = {
    prepareLightRequest: jest.fn(),
    writeLightRequestInCache: jest.fn(),
    readLightResponseFromCache: jest.fn(),
    parseLightResponse: jest.fn(),
  };

  const req = {
    query: {
      country: 'BE',
    },
  };
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EidasClientController],
      providers: [ConfigService, EidasClientService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(EidasClientService)
      .useValue(eidasClientServiceMock)
      .compile();

    controller = module.get<EidasClientController>(EidasClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('redirectToFrNode', () => {
    const token =
      'SGV5LCBzZXJpb3VzbHksIGRpZCB5b3UgcmVhbGx5IGV4cGVjdCB0byBmaW5kIHNtZXRoaW5nIGhlcmUgOkQgPw==';
    const lightRequest = 'Not a darkRequest';
    const requestJson = {
      id: expect.any(String),
      citizenCountryCode: 'BE',
      issuer: 'EIDASBridge Connector',
      levelOfAssurance: 'low',
      nameIdFormat: 'unspecified',
      providerName: 'FranceConnect',
      spType: 'public',
      relayState: 'myState',
      requestedAttributes: [
        'PersonIdentifier',
        'CurrentFamilyName',
        'CurrentGivenName',
        'DateOfBirth',
        'CurrentAddress',
        'Gender',
        'BirthName',
        'PlaceOfBirth',
      ],
    };

    const connectorRequestCacheUrl = 'https://eidas-fr-node/connector';

    beforeEach(() => {
      eidasClientServiceMock.prepareLightRequest.mockReturnValueOnce({
        token,
        lightRequest,
      });
      configServiceMock.get.mockReturnValueOnce({
        connectorRequestCacheUrl,
      });
    });

    it('should call the prepareLightRequest with the request object', async () => {
      // action
      await controller.redirectToFrNode(req.query);

      // expect
      expect(eidasClientServiceMock.prepareLightRequest).toHaveBeenCalledTimes(
        1,
      );
      expect(eidasClientServiceMock.prepareLightRequest).toHaveBeenCalledWith(
        requestJson,
      );
    });

    it('should call writeLightRequestInCache with the light request id and the light request', async () => {
      // action
      await controller.redirectToFrNode(req.query);

      // expect
      expect(
        eidasClientServiceMock.writeLightRequestInCache,
      ).toHaveBeenCalledTimes(1);
      expect(
        eidasClientServiceMock.writeLightRequestInCache,
      ).toHaveBeenCalledWith(requestJson.id, lightRequest);
    });

    it('should get the connectorRequestCacheUrl from the config', async () => {
      // action
      await controller.redirectToFrNode(req.query);

      // expect
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('EidasClient');
    });

    it('should the connectorRequestCacheUrl and the light request token', async () => {
      // action
      const result = await controller.redirectToFrNode(req.query);

      // expect
      expect(result).toStrictEqual({
        connectorRequestCacheUrl,
        token,
      });
    });
  });

  describe('callback', () => {
    const bodyMock = {
      token: 'token',
    };
    const lightReponse = "42, but it's light";
    const responseJson = {
      foo: 'bar',
    };

    it('should call readLightResponseFromCache with the token in the given body', async () => {
      // action
      await controller.callback(bodyMock);

      // expect
      expect(
        eidasClientServiceMock.readLightResponseFromCache,
      ).toHaveBeenCalledTimes(1);
      expect(
        eidasClientServiceMock.readLightResponseFromCache,
      ).toHaveBeenCalledWith(bodyMock.token);
    });

    it('should call parseLightResponse with the light response from the cache', async () => {
      // setup
      eidasClientServiceMock.readLightResponseFromCache.mockReturnValueOnce(
        lightReponse,
      );

      // action
      await controller.callback(bodyMock);

      // expect
      expect(eidasClientServiceMock.parseLightResponse).toHaveBeenCalledTimes(
        1,
      );
      expect(eidasClientServiceMock.parseLightResponse).toHaveBeenCalledWith(
        lightReponse,
      );
    });

    it('should return the response parsed as a json', async () => {
      // setup
      eidasClientServiceMock.parseLightResponse.mockReturnValueOnce(
        responseJson,
      );

      // action
      const result = await controller.callback(bodyMock);

      // expect
      expect(result).toStrictEqual(responseJson);
    });
  });
});
