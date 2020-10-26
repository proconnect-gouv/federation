import * as OidcProviderInstance from 'oidc-provider/lib/helpers/weak_cache';
import { JWK, JWKS } from 'jose';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { OidcProviderService } from '@fc/oidc-provider';
import { OverrideOidcProviderService } from './override-oidc-provider.service';

describe('OverrideOidcProviderService', () => {
  let service: OverrideOidcProviderService;

  const configMock = {
    get: jest.fn(),
  };

  const loggerMock = ({
    setContext: jest.fn(),
    debug: jest.fn(),
  } as unknown) as LoggerService;

  const providerMock = {};
  const oidcProviderMock = {
    getProvider: jest.fn(),
  };

  const JWKasKeyMock = jest.spyOn(JWK, 'asKey');
  const JWKSKeyStoreMock = jest.spyOn(JWKS, 'KeyStore');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        LoggerService,
        OidcProviderService,
        OverrideOidcProviderService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderMock)
      .compile();

    service = module.get<OverrideOidcProviderService>(
      OverrideOidcProviderService,
    );

    jest.resetAllMocks();
    JWKasKeyMock.mockImplementation((value: any) => value);
    JWKSKeyStoreMock.mockImplementation((value: any) => value);
    oidcProviderMock.getProvider.mockReturnValue(providerMock);
    configMock.get.mockReturnValue({ sigHsmPubKey: 'foo' });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should call internal initializers', () => {
      // Given
      service['overrideKeystore'] = jest.fn();
      // When
      service.onApplicationBootstrap();
      // Then
      expect(service['overrideKeystore']).toHaveBeenCalledTimes(1);
    });
  });

  describe('overrideKeystore', () => {
    it('should create a Key object from config key', () => {
      // When
      service['overrideKeystore']();
      // Then
      expect(JWKasKeyMock).toHaveBeenCalledTimes(1);
      expect(JWKasKeyMock).toHaveBeenCalledWith('foo');
    });
    it('should create as keystore with built key', () => {
      // Given
      const keyMock: any = Symbol('keyMock');
      JWKasKeyMock.mockReturnValueOnce(keyMock);
      // When
      service['overrideKeystore']();
      // Then
      expect(JWKSKeyStoreMock).toHaveBeenCalledTimes(1);
      expect(JWKSKeyStoreMock).toHaveBeenCalledWith([keyMock]);
    });
    it('should affect the keystore to provider instance', () => {
      // Given
      const instanceSpy = OidcProviderInstance(providerMock);
      // When
      service['overrideKeystore']();
      // Then
      expect(instanceSpy).toEqual({ keystore: ['foo'] });
    });
  });
});
