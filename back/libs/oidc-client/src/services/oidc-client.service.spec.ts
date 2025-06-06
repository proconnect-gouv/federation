import { ValidationError } from 'class-validator';
import { TokenSet } from 'openid-client';

import { LoggerService } from '@fc/logger';

import {
  OidcClientTokenResultFailedException,
  OidcClientUserinfosFailedException,
} from '../exceptions';
import { OidcClientService } from './oidc-client.service';
import { OidcClientUtilsService } from './oidc-client-utils.service';

describe('OidcClientService', () => {
  let service: OidcClientService;
  let utilsMock: jest.Mocked<OidcClientUtilsService>;
  let loggerMock: jest.Mocked<LoggerService>;
  const jwtMock =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  beforeEach(() => {
    utilsMock = {
      getTokenSet: jest.fn(),
      getUserInfo: jest.fn(),
      getEndSessionUrl: jest.fn(),
      hasEndSessionUrl: jest.fn(),
    } as unknown as jest.Mocked<OidcClientUtilsService>;

    loggerMock = {
      info: jest.fn(),
      debug: jest.fn(),
      err: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    service = new OidcClientService(utilsMock, loggerMock);
  });

  describe('getToken', () => {
    it('should return token results on success', async () => {
      const tokenSetMock = {
        access_token: 'accessToken',
        id_token: jwtMock,
        refresh_token: 'refreshToken',
        claims: jest.fn().mockReturnValue({
          acr: 'acrMock',
        }),
      } as unknown as TokenSet;
      utilsMock.getTokenSet.mockResolvedValueOnce(tokenSetMock);

      const result = await service.getToken(
        'idpId1',
        { state: 'state1', nonce: 'nonce1' },
        {} as any,
      );

      expect(result).toEqual({
        accessToken: 'accessToken',
        idToken: jwtMock,
        refreshToken: 'refreshToken',
        acr: 'acrMock',
        amr: [],
      });
    });

    it('should throw an exception if token validation fails', async () => {
      utilsMock.getTokenSet.mockResolvedValueOnce({
        access_token: 'accessToken',
        id_token: jwtMock,
        claims: jest.fn().mockReturnValue({
          acr: 'acrMock',
          amr: 'amrMock', // amr should be an array, this should trigger a validation error
        }),
      } as unknown as TokenSet);

      await expect(
        service.getToken(
          'idpId',
          { state: 'stateValue', nonce: 'nonceValue' },
          {} as any,
        ),
      ).rejects.toThrow(OidcClientTokenResultFailedException);
      expect(loggerMock.info).toHaveBeenCalledWith({
        tokenValidationErrors: [expect.any(ValidationError)],
      });
    });
  });

  describe('getUserinfo', () => {
    it('should return user infos on success', async () => {
      const identityMock = {
        sub: 'subMock',
        given_name: 'nameMock',
        usual_name: 'nameMock',
        email: 'emailMock',
        uid: 'uidMock',
      };
      utilsMock.getUserInfo.mockResolvedValueOnce(identityMock);

      const result = await service.getUserinfo({
        accessToken: 'accessTokenMock',
        idpId: 'idpIdMock',
      });

      expect(result).toEqual(identityMock);
    });

    it('should throw an exception if fetching user info fails', async () => {
      utilsMock.getUserInfo.mockRejectedValueOnce(new Error('Fetch error'));

      await expect(
        service.getUserinfo({
          accessToken: 'accessTokenMock',
          idpId: 'idpIdMock',
        }),
      ).rejects.toThrow(OidcClientUserinfosFailedException);
    });
  });

  describe('getEndSessionUrl', () => {
    it('should return end session URL', async () => {
      const endSessionUrlMock = 'https://mock-end-session-url.com';
      utilsMock.getEndSessionUrl.mockResolvedValueOnce(endSessionUrlMock);

      const result = await service.getEndSessionUrl(
        'idpIdMock',
        'stateMock',
        'idTokenMock',
        'postLogoutRedirectUriMock',
      );

      expect(result).toBe(endSessionUrlMock);
    });
  });

  describe('hasEndSessionUrl', () => {
    it('should return true if end session URL exists', async () => {
      utilsMock.hasEndSessionUrl.mockResolvedValueOnce(true);

      const result = await service.hasEndSessionUrl('idpIdMock');

      expect(result).toBe(true);
    });

    it('should return false if end session URL does not exist', async () => {
      utilsMock.hasEndSessionUrl.mockResolvedValueOnce(false);

      const result = await service.hasEndSessionUrl('idpIdMock');

      expect(result).toBe(false);
    });
  });
});
