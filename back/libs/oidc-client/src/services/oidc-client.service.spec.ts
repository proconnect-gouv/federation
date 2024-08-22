import { Test, TestingModule } from '@nestjs/testing';

import { PartialExcept, validateDto } from '@fc/common';
import { LoggerService } from '@fc/logger';
import { IOidcIdentity } from '@fc/oidc';
import { TrackedEventContextInterface, TrackingService } from '@fc/tracking';

import { getLoggerMock } from '@mocks/logger';

import {
  OidcClientMissingIdentitySubException,
  OidcClientTokenResultFailedException,
  OidcClientUserinfosFailedException,
} from '../exceptions';
import { ExtraTokenParams, TokenParams, UserInfosParams } from '../interfaces';
import { OidcClientService } from './oidc-client.service';
import { OidcClientUtilsService } from './oidc-client-utils.service';

jest.mock('@fc/common', () => ({
  ...(jest.requireActual('@fc/common') as any),
  validateDto: jest.fn(),
}));

describe('OidcClientService', () => {
  let service: OidcClientService;
  let validateDtoMock;

  const postLogoutRedirectUriMock = 'https://postLogoutRedirectUriMock';

  const idpIdMock = 'idpIdMockValue';
  const idpStateMock = 'idpStateMockValue';
  const idpNonceMock = 'idpNonceMockValue';
  const acrMock = 'acrMockValue';
  const amrMock = ['amrMockValue'];
  const accessTokenMock = 'accessTokenMockValue';
  const idTokenMock = 'idTokenMockValue';

  const contextMock: TrackedEventContextInterface = {
    hello: 'world',
  };

  const loggerServiceMock = getLoggerMock();

  const trackingServiceMock = {
    track: jest.fn(),
  };

  const oidcClientUtilsServiceMock = {
    getTokenSet: jest.fn(),
    getUserInfo: jest.fn(),
    getEndSessionUrl: jest.fn(),
    hasEndSessionUrl: jest.fn(),
  };

  const claimsMock = jest.fn();

  const tokenResultMock = {
    access_token: accessTokenMock,
    id_token: idTokenMock,
    claims: claimsMock,
  };

  const errorMock = new Error('Unknown Error');

  const tokenParamsMock: TokenParams = {
    state: idpStateMock,
    nonce: idpNonceMock,
  };

  const extraParamsMock: ExtraTokenParams = {
    foo: 'bar',
  };

  const identityMock: PartialExcept<IOidcIdentity, 'sub'> = {
    sub: 'xxxxxxyyyyy1122334455667788',
    given_name: 'jean-paul',
    family_name: 'rive',
  };

  const userInfosParamsMock: UserInfosParams = {
    accessToken: accessTokenMock,
    idpId: idpIdMock,
  };

  const repScopeMock = ['scope1'];

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        OidcClientUtilsService,
        OidcClientService,
        LoggerService,
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

    validateDtoMock = jest.mocked(validateDto);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getTokenFromProvider', () => {
    beforeEach(() => {
      claimsMock.mockReturnValueOnce({
        acr: acrMock,
        amr: amrMock,
        rep_scope: repScopeMock,
      });
      oidcClientUtilsServiceMock.getTokenSet.mockResolvedValueOnce(
        tokenResultMock,
      );

      validateDtoMock
        .mockResolvedValueOnce([]) // no errors
        .mockResolvedValueOnce([]); // no errors
    });

    it('should call getTokenSet with token params', async () => {
      // action
      await service.getTokenFromProvider(
        idpIdMock,
        tokenParamsMock,
        contextMock,
        extraParamsMock,
      );
      // assert
      expect(oidcClientUtilsServiceMock.getTokenSet).toHaveBeenCalledTimes(1);
      expect(oidcClientUtilsServiceMock.getTokenSet).toHaveBeenCalledWith(
        contextMock,
        idpIdMock,
        tokenParamsMock,
        extraParamsMock,
      );
    });

    it('should get the the tokenSet from the provider', async () => {
      // arrange
      const resultMock = {
        accessToken: accessTokenMock,
        idToken: idTokenMock,
        acr: acrMock,
        amr: amrMock,
        idpRepresentativeScope: repScopeMock,
      };
      // action
      const result = await service.getTokenFromProvider(
        idpIdMock,
        tokenParamsMock,
        contextMock,
      );
      // assert
      expect(result).toStrictEqual(resultMock);
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
        () =>
          service.getTokenFromProvider(idpIdMock, tokenParamsMock, contextMock),
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
        () =>
          service.getTokenFromProvider(idpIdMock, tokenParamsMock, contextMock),
        // assert
      ).rejects.toThrow(OidcClientTokenResultFailedException);
      expect(oidcClientUtilsServiceMock.getTokenSet).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.debug).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.debug).toHaveBeenCalledWith([errorMock]);
    });

    it('should get claims from token', async () => {
      // action
      const { acr } = await service.getTokenFromProvider(
        idpIdMock,
        tokenParamsMock,
        contextMock,
      );

      // assert
      expect(claimsMock).toHaveBeenCalledTimes(1);
      expect(acr).toStrictEqual(acrMock);
    });

    it('should get an empty array as amr if amr claims is empty', async () => {
      // arrange
      claimsMock.mockReset().mockReturnValueOnce({});
      // action
      const { amr } = await service.getTokenFromProvider(
        idpIdMock,
        tokenParamsMock,
        contextMock,
      );
      // assert
      expect(claimsMock).toHaveBeenCalledTimes(1);
      expect(amr).toStrictEqual([]);
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
        idpIdMock,
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
      ).rejects.toThrow(OidcClientMissingIdentitySubException);
      expect(oidcClientUtilsServiceMock.getUserInfo).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.debug).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.debug).toHaveBeenCalledWith([errorMock]);
    });
  });

  describe('getEndSessionUrlFromProvider', () => {
    it('should call oidcClientUtilsServiceMock.getEndSessionUrl() with given parameters', async () => {
      // action
      await service.getEndSessionUrlFromProvider(
        idpIdMock,
        idpStateMock,
        idTokenMock,
        postLogoutRedirectUriMock,
      );

      // assert
      expect(oidcClientUtilsServiceMock.getEndSessionUrl).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcClientUtilsServiceMock.getEndSessionUrl).toHaveBeenCalledWith(
        idpIdMock,
        idpStateMock,
        idTokenMock,
        postLogoutRedirectUriMock,
      );
    });
  });

  describe('hasEndSessionUrlFromProvider()', () => {
    it('should call oidcClientUtilsServiceMock.hasEndSessionUrl() with given parameters', async () => {
      // action
      await service.hasEndSessionUrlFromProvider(idpIdMock);

      // assert
      expect(oidcClientUtilsServiceMock.hasEndSessionUrl).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcClientUtilsServiceMock.hasEndSessionUrl).toHaveBeenCalledWith(
        idpIdMock,
      );
    });
  });
});
