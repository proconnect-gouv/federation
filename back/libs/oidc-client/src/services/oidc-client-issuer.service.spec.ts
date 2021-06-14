import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ClientMetadata } from 'oidc-provider';
import { Client, custom, Issuer } from 'openid-client';
import {
  OidcClientProviderNotFoundException,
  OidcClientProviderDisabledException,
} from '../exceptions';
import { OidcClientConfigService } from './oidc-client-config.service';
import { OidcClientIssuerService } from './oidc-client-issuer.service';

describe('OidcClientIssuerService', () => {
  let service: OidcClientIssuerService;

  const loggerServiceMock = {
    setContext: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn(),
  } as unknown as LoggerService;

  const oidcClientConfigServiceMock = {
    get: jest.fn(),
  };

  const issuerProxyMock = jest.fn() as unknown as Issuer<Client>;
  issuerProxyMock['discover'] = jest.fn();

  const idpMetadataMock = {
    jwks: [],
    httpOtions: {},
    providers: [
      {
        uid: 'idpUidMock',
        name: 'idpNameMock',
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        redirect_uris: ['redirect', 'uris'],
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        response_types: ['response', 'types'],
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        discoveryUrl: 'mock well-known url',
      },
    ],
    discovery: true,
    discoveryUrl: 'mock well-known url',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcClientIssuerService,
        LoggerService,
        OidcClientConfigService,
      ],
    })
      .overrideProvider(OidcClientConfigService)
      .useValue(oidcClientConfigServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<OidcClientIssuerService>(OidcClientIssuerService);

    jest.resetAllMocks();

    service['IssuerProxy'] = issuerProxyMock as any;
    oidcClientConfigServiceMock.get.mockResolvedValue(idpMetadataMock);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getClient', () => {
    // Given
    const issuerMock = {
      Client: jest.fn(),
    };

    const issuerId = 'foo';

    beforeEach(() => {
      service['getIdpMetadata'] = jest.fn().mockResolvedValue(idpMetadataMock);
      service['getIssuer'] = jest.fn().mockResolvedValue(issuerMock);
    });

    it('should call getIssuer', async () => {
      // When
      await service.getClient(issuerId);
      // Then
      expect(service['getIssuer']).toHaveBeenCalledTimes(1);
      expect(service['getIssuer']).toHaveBeenCalledWith(issuerId);
    });

    it('should instantiate new client', async () => {
      // When
      await service.getClient(issuerId);
      // Then
      expect(issuerMock.Client).toHaveBeenCalledTimes(1);
      expect(issuerMock.Client).toHaveBeenCalledWith(
        idpMetadataMock,
        idpMetadataMock.jwks,
      );
    });

    it('should call config', async () => {
      // When
      await service.getClient(issuerId);
      // Then
      expect(oidcClientConfigServiceMock.get).toHaveBeenCalledTimes(1);
    });

    it('should return created client instance', async () => {
      // Given
      const clientInstanceMock = {};
      issuerMock.Client.mockReturnValue(clientInstanceMock);
      // When
      const result = await service.getClient(issuerId);
      // Then
      expect(result).toBe(clientInstanceMock);
    });

    it('should set httpOptions on client', async () => {
      // Given
      const clientInstanceMock = {};
      issuerMock.Client.mockReturnValue(clientInstanceMock);
      const getHttpOptionsReturnValue = Symbol('getHttpOptionsReturnValue');
      service['getHttpOptions'] = jest
        .fn()
        .mockReturnValue(getHttpOptionsReturnValue);
      const options = {};
      // When
      const client = await service.getClient(issuerId);
      const result = client[custom.http_options](options);
      // Then
      expect(result).toBe(getHttpOptionsReturnValue);
    });
  });

  describe('getHttpOptions', () => {
    it('should return fusion from config and input', () => {
      // Given
      const givenOptions = { foo: 'bar' };
      const configOptions = { fizz: 'buzz' };
      // When
      const result = service['getHttpOptions'](configOptions, givenOptions);
      // Then
      expect(result).toEqual({
        foo: 'bar',
        fizz: 'buzz',
      });
    });
  });

  describe('getIssuer', () => {
    beforeEach(() => {
      service['getIdpMetadata'] = jest.fn().mockResolvedValue(idpMetadataMock);
    });
    it('should call getIdpMetadata', async () => {
      // Given
      const issuerId = 'foo';
      // When
      await service['getIssuer'](issuerId);
      // Then
      expect(service['getIdpMetadata']).toHaveBeenCalledTimes(1);
      expect(service['getIdpMetadata']).toHaveBeenCalledWith(issuerId);
    });
    it('should call IssuerProxy.discover', async () => {
      // Given
      const issuerId = 'foo';
      // When
      await service['getIssuer'](issuerId);
      // Then
      expect(issuerProxyMock.discover).toHaveBeenCalledTimes(1);
      expect(issuerProxyMock.discover).toHaveBeenCalledWith(
        idpMetadataMock.discoveryUrl,
      );
    });
    it('should instantiate IssuerProxy', async () => {
      // Given
      const issuerId = 'foo';
      const noDiscoveryMetadata = {
        ...idpMetadataMock,
        discovery: false,
      };
      service['getIdpMetadata'] = jest
        .fn()
        .mockResolvedValue(noDiscoveryMetadata);
      // When
      await service['getIssuer'](issuerId);
      // Then
      expect(service['IssuerProxy']).toHaveBeenCalledTimes(1);
      expect(service['IssuerProxy']).toHaveBeenCalledWith(noDiscoveryMetadata);
    });
  });

  describe('getIdpMetadata', () => {
    // Given
    const providerMock1 = {
      name: 'provider1',
      uid: 'p1',
      active: true,
    } as unknown as ClientMetadata;
    const providerMock2 = {
      name: 'provider2',
      uid: 'p2',
      active: true,
    } as unknown as ClientMetadata;
    const providerMock3 = {
      name: 'provider3',
      uid: 'p3',
      active: false,
    } as unknown as ClientMetadata;
    const providers = [providerMock1, providerMock2, providerMock3];

    it('should return provider in config', async () => {
      // Given
      oidcClientConfigServiceMock.get.mockResolvedValue({ providers });
      // When
      const result = await service['getIdpMetadata']('p2');
      // Then
      expect(result).toBe(providerMock2);
    });
    it('should throw if provider is not in config', async () => {
      // Given
      oidcClientConfigServiceMock.get.mockResolvedValue({ providers });
      // Then
      expect(service['getIdpMetadata']('p0')).rejects.toThrow(
        OidcClientProviderNotFoundException,
      );
    });
    it('should throw if provider is not active', async () => {
      // Given
      oidcClientConfigServiceMock.get.mockResolvedValue({ providers });
      // Then
      expect(service['getIdpMetadata']('p3')).rejects.toThrow(
        OidcClientProviderDisabledException,
      );
    });
  });
});
