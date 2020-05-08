/* eslint-disable @typescript-eslint/camelcase */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { CryptographyService } from '@fc/cryptography';
import { IdentityProviderService } from './identity-provider.service';

describe('IdentityProviderService', () => {
  let service: IdentityProviderService;
  const mockCryptography = {
    decryptClientSecret: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
  };

  const mockExec = jest.fn();

  const identityProviderModel = getModelToken('IdentityProvider');

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptographyService,
        IdentityProviderService,
        {
          provide: identityProviderModel,
          useValue: mockRepository,
        },
      ],
    })
      .overrideProvider(CryptographyService)
      .useValue(mockCryptography)
      .compile();

    service = module.get<IdentityProviderService>(IdentityProviderService);

    mockExec.mockReturnValueOnce([
      {
        _doc: {
          name: 'provider1',
          clientID: 'clientID',
          client_secret: 'client_secret',
          discoveryUrl: 'well_known_url',
          id_token_signed_response_alg: 'HS256',
          post_logout_redirect_uris: [
            'https://corev2.docker.dev-franceconnect.fr/api/v2/logout-from-provider',
          ],
          redirect_uris: [
            'https://corev2.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1v2',
          ],
          response_types: ['code'],
          token_endpoint_auth_method: 'client_secret_post',
          id_token_encrypted_response_alg: 'RSA-OAEP',
          id_token_encrypted_response_enc: 'A256GCM',
          userinfo_encrypted_response_alg: 'RSA-OAEP',
          userinfo_encrypted_response_enc: 'A256GCM',
          userinfo_signed_response_alg: 'HS256',
        },
      },
    ]);
    mockRepository.find.mockReturnValueOnce({ exec: mockExec });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('legacyToOpenIdPropertyName', () => {
    it('should return identity provider with change legacy property name by openid property name', () => {
      // setup
      const identityProviderMock = {
        name: 'idp name',
        clientID: '123',
        client_secret: 'secret hash',
        redirect_uris: ['redirect_uris'],
        post_logout_redirect_uris: ['post_logout_redirect_uris'],
        id_token_signed_response_alg: 'id_token_signed_response_alg',
        id_token_encrypted_response_alg: 'id_token_encrypted_response_alg',
        id_token_encrypted_response_enc: 'id_token_encrypted_response_enc',
        userinfo_encrypted_response_alg: 'userinfo_encrypted_response_alg',
        userinfo_encrypted_response_enc: 'userinfo_encrypted_response_enc',
        userinfo_signed_response_alg: 'userinfo_signed_response_alg',
        response_types: ['response types'],
        token_endpoint_auth_method: 'token_endpoint_auth_method',
        discoveryUrl: 'https://sp-site.fr/discovery-url',
      };

      // action
      mockCryptography.decryptClientSecret.mockReturnValueOnce('client_secret');
      const result = service['legacyToOpenIdPropertyName'](
        identityProviderMock,
      );

      // expect
      expect(result).toStrictEqual({
        name: 'idp name',
        client_id: '123',
        client_secret: 'client_secret',
        redirect_uris: ['redirect_uris'],
        post_logout_redirect_uris: ['post_logout_redirect_uris'],
        id_token_signed_response_alg: 'id_token_signed_response_alg',
        id_token_encrypted_response_alg: 'id_token_encrypted_response_alg',
        id_token_encrypted_response_enc: 'id_token_encrypted_response_enc',
        userinfo_encrypted_response_alg: 'userinfo_encrypted_response_alg',
        userinfo_encrypted_response_enc: 'userinfo_encrypted_response_enc',
        userinfo_signed_response_alg: 'userinfo_signed_response_alg',
        response_types: ['response types'],
        token_endpoint_auth_method: 'token_endpoint_auth_method',
        discoveryUrl: 'https://sp-site.fr/discovery-url',
      });
    });
  });

  describe('findAllIdentityProvider', () => {
    it('should resolve', async () => {
      // action
      const result = service['findAllIdentityProvider']();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should have called find once', async () => {
      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return result of type list', async () => {
      // action
      const result = await service['findAllIdentityProvider']();

      // expect
      expect(result).toStrictEqual([
        {
          name: 'provider1',
          clientID: 'clientID',
          client_secret: 'client_secret',
          discoveryUrl: 'well_known_url',
          id_token_signed_response_alg: 'HS256',
          post_logout_redirect_uris: [
            'https://corev2.docker.dev-franceconnect.fr/api/v2/logout-from-provider',
          ],
          redirect_uris: [
            'https://corev2.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1v2',
          ],
          response_types: ['code'],
          token_endpoint_auth_method: 'client_secret_post',
          id_token_encrypted_response_alg: 'RSA-OAEP',
          id_token_encrypted_response_enc: 'A256GCM',
          userinfo_encrypted_response_alg: 'RSA-OAEP',
          userinfo_encrypted_response_enc: 'A256GCM',
          userinfo_signed_response_alg: 'HS256',
        },
      ]);
    });
  });

  describe('getList', () => {
    it('should resolve', async () => {
      // action
      const result = service.getList();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should return result of type list', async () => {
      // action
      mockCryptography.decryptClientSecret.mockReturnValueOnce('client_secret');
      const result = await service.getList();

      // expect
      expect(result).toStrictEqual([
        {
          name: 'provider1',
          client_id: 'clientID',
          client_secret: 'client_secret',
          discoveryUrl: 'well_known_url',
          id_token_signed_response_alg: 'HS256',
          post_logout_redirect_uris: [
            'https://corev2.docker.dev-franceconnect.fr/api/v2/logout-from-provider',
          ],
          redirect_uris: [
            'https://corev2.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1v2',
          ],
          response_types: ['code'],
          token_endpoint_auth_method: 'client_secret_post',
          id_token_encrypted_response_alg: 'RSA-OAEP',
          id_token_encrypted_response_enc: 'A256GCM',
          userinfo_encrypted_response_alg: 'RSA-OAEP',
          userinfo_encrypted_response_enc: 'A256GCM',
          userinfo_signed_response_alg: 'HS256',
        },
      ]);
    });
  });
});
