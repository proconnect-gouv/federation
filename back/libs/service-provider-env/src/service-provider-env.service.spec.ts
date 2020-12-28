import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { ServiceProviderEnvService } from './service-provider-env.service';

describe('ServiceProviderService', () => {
  let service: ServiceProviderEnvService;

  const validServiceProviderMock = {
    name: 'FSA - FSA1v2',
    title: 'FSA - TITLE',
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uris: [
      'https://fca.docker.dev-franceconnect.fr/api/v2/oidc-callback/fia1v2',
    ],
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    post_logout_redirect_uris: [
      'https://fca.docker.dev-franceconnect.fr/logout-callback',
    ],
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_secret: 'client_secret',
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: '123',
    active: true,
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __v: 4,
    updatedAt: new Date('2019-04-24 17:09:17'),
    updatedBy: 'admin',
    scope: 'openid profile',
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_signed_response_alg: 'ES256',
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_encrypted_response_alg: 'RSA-OAEP',
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_encrypted_response_enc: 'A256GCM',
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_signed_response_alg: 'ES256',
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_encrypted_response_alg: 'RSA-OAEP',
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_encrypted_response_enc: 'A256GCM',
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    jwks_uri:
      'https://fca.docker.dev-franceconnect.fr/api/v2/client/.well-known/keys',
  };

  const configMock = {
    get: jest.fn(),
  };

  const serviceProviderListMock = [validServiceProviderMock];

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceProviderEnvService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .compile();

    service = module.get<ServiceProviderEnvService>(ServiceProviderEnvService);

    configMock.get.mockReturnValue(validServiceProviderMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getList', () => {
    beforeEach(() => {
      service['findAllServiceProvider'] = jest
        .fn()
        .mockResolvedValueOnce(serviceProviderListMock);
    });

    it('should resolve', async () => {
      // setup

      // action
      const result = service.getList();

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return service provider list)', async () => {
      const expected = [
        {
          ...validServiceProviderMock,
          // oidc param name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_id: '123',
          // oidc param name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_secret: 'client_secret',
          scope: 'openid profile',
        },
      ];
      // action
      const result = await service.getList();

      // expect
      expect(result).toStrictEqual(expected);
    });
  });

  describe('getById', () => {
    // Given
    const spListMock = [
      {
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id: 'wizz',
      },
      {
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id: 'foo',
      },
      {
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id: 'bar',
      },
    ];

    it('should return an existing SP', async () => {
      // Given
      const idMock = 'foo';
      service.getList = jest.fn().mockResolvedValueOnce(spListMock);
      // When
      const result = await service.getById(idMock);
      // Then
      expect(result).toEqual({
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id: 'foo',
      });
    });
    it('should return undefined for non existing SP', async () => {
      // Given
      const idMock = 'nope';
      service.getList = jest.fn().mockResolvedValueOnce(spListMock);
      // When
      const result = await service.getById(idMock);
      // Then
      expect(result).toBeUndefined();
    });
    it('should pass refresh flag to getList method', async () => {
      // Given
      const idMock = 'foo';
      service.getList = jest.fn().mockResolvedValueOnce(spListMock);
      // When
      await service.getById(idMock);
      // Then
      expect(service.getList).toHaveBeenCalledTimes(1);
    });
  });
});
