import { Test, TestingModule } from '@nestjs/testing';

import { PartnersServiceProviderInstance } from '@entities/typeorm';

import { getTransformed } from '@fc/common';
import { ConfigService } from '@fc/config';
import { ServiceProviderInstanceVersionDto } from '@fc/partners-service-provider-instance-version';
import {
  ClientTypeEnum,
  OidcClientInterface,
  SignatureAlgorithmEnum,
} from '@fc/service-provider';

import { getConfigMock } from '@mocks/config';

import { PartnersInstanceVersionFormService } from './partners-instance-version-form.service';

describe('PartnersInstanceVersionFormService', () => {
  let service: PartnersInstanceVersionFormService;

  const configServiceMock = getConfigMock();

  const clientIdMock = 'client_id mock';

  const configDataMock = {
    active: false,
    type: ClientTypeEnum.PUBLIC,
    client_id: clientIdMock,
    scopes: ['openid'],
    claims: [],
    rep_scope: [],
    client_secret:
      'ffabf84ed1bfe1f94097b66495d1760282053ab01e77c8c9c65de65b61f0c73a',
    idpFilterExclude: true,
    idpFilterList: [],
    identityConsent: false,
    ssoDisabled: false,
  };

  const databaseVersionMock: Partial<OidcClientInterface> = {
    name: 'instance name',
    entityId: clientIdMock,
    client_id: clientIdMock,
    signupId: '123456',
    id_token_signed_response_alg: SignatureAlgorithmEnum.ES256,
    site: ['https://site.fr'],
    redirect_uris: ['https://site.fr/callback'],
    post_logout_redirect_uris: ['https://site.fr/logout'],
    IPServerAddressesAndRanges: [],
    ...configDataMock,
  };

  const formVersionMock: Partial<OidcClientInterface> = getTransformed(
    {
      name: 'instance name',
      entityId: clientIdMock,
      signupId: '123456',
      id_token_signed_response_alg: SignatureAlgorithmEnum.ES256,
      site: ['https://site.fr'],
      redirect_uris: ['https://site.fr/callback'],
      post_logout_redirect_uris: ['https://site.fr/logout'],
      IPServerAddressesAndRanges: [],
    },
    ServiceProviderInstanceVersionDto,
  );

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PartnersInstanceVersionFormService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<PartnersInstanceVersionFormService>(
      PartnersInstanceVersionFormService,
    );

    configServiceMock.get.mockReturnValue(configDataMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fromFormValues', () => {
    it('should add default values from config', () => {
      // When
      const result = service.fromFormValues(formVersionMock);

      // Then
      expect(result).toStrictEqual(databaseVersionMock);
    });

    it('should keep provided entityId', () => {
      // When
      const result = service.fromFormValues(formVersionMock);

      // Then
      expect(result).toStrictEqual(databaseVersionMock);
    });
  });

  describe('toFormValues', () => {
    it('should remove private values', () => {
      // Given
      const instanceMock = {
        versions: [
          {
            data: databaseVersionMock,
          },
        ],
      } as unknown as PartnersServiceProviderInstance;

      // When
      const result = service.toFormValues(instanceMock);

      // Then
      expect(result).toStrictEqual({
        ...instanceMock,
        versions: [
          {
            data: formVersionMock,
          },
        ],
      });
    });
  });
});
