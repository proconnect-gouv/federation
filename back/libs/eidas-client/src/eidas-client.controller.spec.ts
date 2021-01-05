import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { EidasClientController } from './eidas-client.controller';
import { EidasClientService } from './eidas-client.service';
import { EidasCountries } from '@fc/eidas';

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
    completeEidasRequest: jest.fn(),
  };

  const exposedSessionMock = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const req = {
    query: {
      country: EidasCountries.BELGIUM,
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
    const partialRequestJson = {
      levelOfAssurance: 'substantial',
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
    const requestJson = {
      ...partialRequestJson,
      id: '0835656565',
      citizenCountryCode: 'BE',
      issuer: 'EIDASBridge Connector',
      nameIdFormat: 'unspecified',
      providerName: 'FranceConnect',
      spType: 'public',
      relayState: 'myState',
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

      exposedSessionMock.get.mockResolvedValueOnce(partialRequestJson);
      eidasClientServiceMock.completeEidasRequest.mockReturnValueOnce(
        requestJson,
      );
    });

    it('should get the eidas partial request from the session', async () => {
      // action
      await controller.redirectToFrNode(req.query, exposedSessionMock);

      // expect
      expect(exposedSessionMock.get).toHaveBeenCalledTimes(1);
      expect(exposedSessionMock.get).toHaveBeenCalledWith(
        'eidasPartialRequest',
      );
    });

    it('should complete the eidas request using the partial eidas request from the session and the country from tthe query', async () => {
      // action
      await controller.redirectToFrNode(req.query, exposedSessionMock);

      // expect
      expect(eidasClientServiceMock.completeEidasRequest).toHaveBeenCalledTimes(
        1,
      );
      expect(eidasClientServiceMock.completeEidasRequest).toHaveBeenCalledWith(
        partialRequestJson,
        req.query.country,
      );
    });

    it('should call the prepareLightRequest with the request object', async () => {
      // action
      await controller.redirectToFrNode(req.query, exposedSessionMock);

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
      await controller.redirectToFrNode(req.query, exposedSessionMock);

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
      await controller.redirectToFrNode(req.query, exposedSessionMock);

      // expect
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('EidasClient');
    });

    it('should the connectorRequestCacheUrl and the light request token', async () => {
      // action
      const result = await controller.redirectToFrNode(
        req.query,
        exposedSessionMock,
      );

      // expect
      expect(result).toStrictEqual({
        connectorRequestCacheUrl,
        token,
      });
    });
  });

  describe('responseHandler', () => {
    const bodyMock = {
      token: 'token',
    };
    const lightReponse = "42, but it's light";

    const redirectAfterResponseHandlingUrl = 'https://response-handling.url';

    const responseJson = {
      url: redirectAfterResponseHandlingUrl,
      statusCode: 302,
    };

    beforeEach(() => {
      configServiceMock.get.mockReturnValueOnce({
        redirectAfterResponseHandlingUrl,
      });
    });

    it('should call readLightResponseFromCache with the token in the given body', async () => {
      // action
      await controller.responseHandler(bodyMock, exposedSessionMock);

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
      await controller.responseHandler(bodyMock, exposedSessionMock);

      // expect
      expect(eidasClientServiceMock.parseLightResponse).toHaveBeenCalledTimes(
        1,
      );
      expect(eidasClientServiceMock.parseLightResponse).toHaveBeenCalledWith(
        lightReponse,
      );
    });

    it('should redirect the user to the redirectAfterResponseHandlingUrl and a 302 status code', async () => {
      // setup
      eidasClientServiceMock.parseLightResponse.mockReturnValueOnce(
        responseJson,
      );

      // action
      const result = await controller.responseHandler(
        bodyMock,
        exposedSessionMock,
      );

      // expect
      expect(result).toStrictEqual(responseJson);
    });
  });
});
