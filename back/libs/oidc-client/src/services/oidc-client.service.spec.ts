import { mocked } from 'ts-jest/utils';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { IEventContext, TrackingService } from '@fc/tracking';
import { validateDto } from '@fc/common';
import { IOidcIdentity } from '@fc/oidc';
import { OidcClientService } from './oidc-client.service';
import { OidcClientUtilsService } from './oidc-client-utils.service';
import { TokenParams, UserInfosParams } from '../interfaces';
import { OidcClientTokenEvent, OidcClientUserinfoEvent } from '../events';
import { OidcClientUserinfosFailedException } from '../exceptions';

jest.mock('@fc/common', () => ({
  ...jest.requireActual('@fc/common'),
  validateDto: jest.fn(),
}));

describe('OidcClientService', () => {
  let service: OidcClientService;
  let validateDtoMock;

  const providerUidMock = 'providerUidMockValue';
  const idpStateMock = 'idpStateMockValue';
  const idpNonceMock = 'idpNonceMockValue';
  const acrMock = 'acrMockValue';
  const amrMock = ['amrMockValue'];
  const accessTokenMock = 'accessTokenMockValue';

  const contextMock: IEventContext = {
    hello: 'world',
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown) as LoggerService;

  const trackingServiceMock = {
    track: jest.fn(),
  };

  const oidcClientUtilsServiceMock = {
    getTokenSet: jest.fn(),
    getUserInfo: jest.fn(),
  };

  const claimsMock = jest.fn();

  const tokenResultMock = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    access_token: accessTokenMock,
    claims: claimsMock,
  };

  const errorMock = new Error('Unknown Error');

  const tokenParamsMock: TokenParams = {
    providerUid: providerUidMock,
    idpState: idpStateMock,
    idpNonce: idpNonceMock,
  };

  const identityMock: IOidcIdentity = {
    sub: 'xxxxxxyyyyy1122334455667788',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    given_name: 'jean-paul',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    family_name: 'rive',
  };

  const userInfosParamsMock: UserInfosParams = {
    accessToken: accessTokenMock,
    providerUid: providerUidMock,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        TrackingService,
        OidcClientUtilsService,
        OidcClientService,
      ],
    })
      .overrideProvider(OidcClientUtilsService)
      .useValue(oidcClientUtilsServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<OidcClientService>(OidcClientService);

    validateDtoMock = mocked(validateDto);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getTokenFromProvider', () => {
    beforeEach(() => {
      claimsMock.mockReturnValueOnce({ acr: acrMock, amr: amrMock });
      oidcClientUtilsServiceMock.getTokenSet.mockResolvedValueOnce(
        tokenResultMock,
      );

      validateDtoMock
        .mockResolvedValueOnce([]) // no errors
        .mockResolvedValueOnce([]); // no errors
    });
    it('should get the access token', async () => {
      // arrange
      const resultMock = {
        accessToken: accessTokenMock,
        acr: acrMock,
        amr: amrMock,
      };
      // action
      const result = await service.getTokenFromProvider(
        tokenParamsMock,
        contextMock,
      );
      // assert
      expect(result).toStrictEqual(resultMock);
    });

    it('should get the accessToken with token params', async () => {
      // action
      await service.getTokenFromProvider(tokenParamsMock, contextMock);
      // assert
      expect(oidcClientUtilsServiceMock.getTokenSet).toHaveBeenCalledTimes(1);
      expect(oidcClientUtilsServiceMock.getTokenSet).toHaveBeenCalledWith(
        contextMock,
        providerUidMock,
        idpStateMock,
        idpNonceMock,
      );
    });

    /**
     * @todo #434 refacto sur getTokenSet, test à appliquer si on vérifie les données d'entrées.
     * - voir commit original : 440d0a1734e0e1206b7e21781cbb0f186a93dd82
     */
    it.skip('should failed if the params for token are wrong', async () => {
      // arrange
      validateDtoMock.mockReset().mockReturnValueOnce([errorMock]);
      // action
      await expect(
        () => service.getTokenFromProvider(tokenParamsMock, contextMock),
        // assert
      ).rejects.toThrow(
        '"{"providerUid":"providerUidMockValue","idpState":"idpStateMockValue","idpNonce":"idpNonceMockValue"}" input was wrong from the result at DTO validation: [{}]',
      );

      expect(oidcClientUtilsServiceMock.getTokenSet).toHaveBeenCalledTimes(0);
    });

    it('should failed if the token is wrong and DTO blocked', async () => {
      // arrange
      validateDtoMock.mockReset().mockReturnValueOnce([errorMock]);

      // action
      await expect(
        () => service.getTokenFromProvider(tokenParamsMock, contextMock),
        // assert
      ).rejects.toThrow(
        '{"acr":"acrMockValue","amr":["amrMockValue"],"accessToken":"accessTokenMockValue"}" input was wrong from the result at DTO validation: [{}]',
      );
      expect(oidcClientUtilsServiceMock.getTokenSet).toHaveBeenCalledTimes(1);
    });

    it('should track the token event', async () => {
      // action
      await service.getTokenFromProvider(tokenParamsMock, contextMock);

      // assert
      expect(trackingServiceMock.track).toHaveBeenCalledTimes(1);
      expect(trackingServiceMock.track).toHaveBeenCalledWith(
        OidcClientTokenEvent,
        contextMock,
      );
    });

    it('should get claims from token', async () => {
      // action
      const { acr } = await service.getTokenFromProvider(
        tokenParamsMock,
        contextMock,
      );

      // assert
      expect(claimsMock).toHaveBeenCalledTimes(1);
      expect(acr).toStrictEqual(acrMock);
    });
  });

  describe('getUserInfosFromProvider', () => {
    beforeEach(() => {
      oidcClientUtilsServiceMock.getUserInfo.mockResolvedValueOnce(
        identityMock,
      );

      validateDtoMock
        .mockResolvedValueOnce([]) // no errors
        .mockResolvedValueOnce([]); // no errors
    });
    it('should get the user infos', async () => {
      // action
      const result = await service.getUserInfosFromProvider(
        userInfosParamsMock,
        contextMock,
      );
      // assert
      expect(result).toStrictEqual(identityMock);
    });

    it('should get the user infos with access token params', async () => {
      // action
      await service.getUserInfosFromProvider(userInfosParamsMock, contextMock);
      // assert
      expect(oidcClientUtilsServiceMock.getUserInfo).toHaveBeenCalledTimes(1);
      expect(oidcClientUtilsServiceMock.getUserInfo).toHaveBeenCalledWith(
        accessTokenMock,
        providerUidMock,
      );
    });

    it('should failed if userinfos failed', async () => {
      // arrange
      const errorMock = new Error('Unknown Error');
      oidcClientUtilsServiceMock.getUserInfo
        .mockReset()
        .mockRejectedValueOnce(errorMock);
      // action
      await expect(
        () =>
          service.getUserInfosFromProvider(userInfosParamsMock, contextMock),
        // assert
      ).rejects.toThrow(OidcClientUserinfosFailedException);

      expect(oidcClientUtilsServiceMock.getUserInfo).toHaveBeenCalledTimes(1);
    });

    it('should failed if the token is wrong and DTO blocked', async () => {
      // arrange
      validateDtoMock.mockReset().mockReturnValueOnce([errorMock]);

      // action
      await expect(
        () =>
          service.getUserInfosFromProvider(userInfosParamsMock, contextMock),
        // assert
      ).rejects.toThrow(
        '"providerUidMockValue" doesn\'t provide a minimum identity information: [{}]',
      );
      expect(oidcClientUtilsServiceMock.getUserInfo).toHaveBeenCalledTimes(1);
    });

    it('should track the userinfos event', async () => {
      // action
      await service.getUserInfosFromProvider(userInfosParamsMock, contextMock);

      // assert
      expect(trackingServiceMock.track).toHaveBeenCalledTimes(1);
      expect(trackingServiceMock.track).toHaveBeenCalledWith(
        OidcClientUserinfoEvent,
        contextMock,
      );
    });
  });
});
