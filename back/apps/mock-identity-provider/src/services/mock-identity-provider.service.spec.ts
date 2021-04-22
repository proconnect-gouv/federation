import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ServiceProviderAdapterEnvService } from '@fc/service-provider-adapter-env';
import { SessionService } from '@fc/session';
import { OidcProviderService } from '@fc/oidc-provider';
import { MockIdentityProviderService } from './mock-identity-provider.service';
import { ConfigService } from '@fc/config';

describe('MockIdentityProviderService', () => {
  let service: MockIdentityProviderService;

  const loggerMock = {
    debug: jest.fn(),
    fatal: jest.fn(),
    setContext: jest.fn(),
  };

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    init: jest.fn(),
  };

  const serviceProviderEnvServiceMock = {
    getList: jest.fn(),
    getById: jest.fn(),
  };

  const getInteractionMock = jest.fn();

  const oidcProviderServiceMock = {
    getInteraction: getInteractionMock,
    registerMiddleware: jest.fn(),
    getInteractionIdFromCtx: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        OidcProviderService,
        MockIdentityProviderService,
        ServiceProviderAdapterEnvService,
        SessionService,
        ConfigService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(ServiceProviderAdapterEnvService)
      .useValue(serviceProviderEnvServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<MockIdentityProviderService>(
      MockIdentityProviderService,
    );

    jest.resetAllMocks();
  });

  describe('onModuleInit', () => {
    it('should call loadDatabase', () => {
      // Given
      service['loadDatabase'] = jest.fn();
      // When
      service.onModuleInit();
      // Then
      expect(service['loadDatabase']).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadDatabase', () => {
    const citizenDatabasePathMock = '/eur';

    beforeEach(() => {
      configServiceMock.get.mockReturnValueOnce({
        configServiceMock: citizenDatabasePathMock,
      });
    });

    it('Should call csvdb library', async () => {
      // Given
      service['csvdbProxy'] = jest.fn().mockResolvedValue({
        rows: [{ foo: 'foo' }],
      });
      // When
      await service['loadDatabase']();
      // Then
      expect(service['csvdbProxy']).toHaveBeenCalledTimes(1);
    });

    it('should log debug when everything works fine', async () => {
      // Given
      service['csvdbProxy'] = jest.fn().mockResolvedValue({
        rows: [{ foo: 'foo' }],
      });
      // When
      await service['loadDatabase']();
      // Then
      expect(loggerMock.debug).toHaveBeenCalledTimes(2);
      expect(loggerMock.debug).toHaveBeenCalledWith('Loading database...');
      expect(loggerMock.debug).toHaveBeenCalledWith(
        'Database loaded (1 entries found)',
      );
    });

    it('should log error when something turns bad', async () => {
      // Given
      const errorMock = new Error();
      // when
      service['csvdbProxy'] = jest.fn().mockRejectedValue(errorMock);
      // Then
      expect(() => service['loadDatabase']()).rejects.toThrow(errorMock);
    });

    it('should call removeEmptyColumns', async () => {
      // Given
      const dataMock = {
        rows: [{ foo: 'foo1' }, { foo: 'bar1' }],
      };
      const NUMBER_OF_CALLS = dataMock.rows.length;
      service['csvdbProxy'] = jest.fn().mockResolvedValue(dataMock);
      service['removeEmptyColums'] = jest.fn();

      // When
      await service['loadDatabase']();
      // Then
      expect(service['removeEmptyColums']).toHaveBeenCalledTimes(
        NUMBER_OF_CALLS,
      );
      expect(service['removeEmptyColums']).toHaveBeenNthCalledWith(
        1,
        dataMock.rows[0],
        0,
        dataMock.rows,
      );
      expect(service['removeEmptyColums']).toHaveBeenNthCalledWith(
        2,
        dataMock.rows[1],
        1,
        dataMock.rows,
      );
    });

    it('should set data to result of removeEmptyColumns', async () => {
      // Given
      const dataMock = {
        rows: [{ foo: 'foo' }],
      };
      const cleanedMock = [{}];
      service['csvdbProxy'] = jest.fn().mockResolvedValue(dataMock);
      service['removeEmptyColums'] = jest.fn().mockReturnValue(cleanedMock);

      // When
      await service['loadDatabase']();
      // Then
      expect(service['database']).toEqual([cleanedMock]);
    });
  });

  describe('authorizationMiddleware', () => {
    const getCtxMock = (hasError = false) => {
      return {
        req: {
          headers: { 'x-forwarded-for': '123.123.123.123' },
        },
        oidc: {
          isError: hasError,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          params: { client_id: 'foo', acr_values: 'eidas3' },
        },
        res: {},
      };
    };
    it('should abort middleware execution if request if flagged as erroring', () => {
      // Given
      const ctxMock = getCtxMock(true);
      service['getInteractionIdFromCtx'] = jest.fn();

      // When
      service['authorizationMiddleware'](ctxMock);

      // Then
      expect(service['getInteractionIdFromCtx']).toHaveBeenCalledTimes(0);
      expect(serviceProviderEnvServiceMock.getById).toHaveBeenCalledTimes(0);
      expect(sessionServiceMock.init).toHaveBeenCalledTimes(0);
    });

    it('should call session.init', async () => {
      // Given
      const ctxMock = getCtxMock();
      oidcProviderServiceMock.getInteractionIdFromCtx = jest
        .fn()
        .mockReturnValue('42');
      serviceProviderEnvServiceMock.getById.mockReturnValueOnce({
        name: 'my SP',
      });
      sessionServiceMock.init.mockResolvedValueOnce(undefined);

      // When
      await service['authorizationMiddleware'](ctxMock);

      // Then
      expect(sessionServiceMock.init).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.init).toHaveBeenCalledWith(ctxMock.res, '42', {
        spId: 'foo',
        spAcr: 'eidas3',
        spName: 'my SP',
      });
    });

    it('should throw if the session initialization fails', async () => {
      // Given
      const ctxMock = getCtxMock();
      service['getInteractionIdFromCtx'] = jest.fn().mockReturnValue('42');
      sessionServiceMock.init.mockRejectedValueOnce(new Error('test'));

      // Then
      await expect(
        service['authorizationMiddleware'](ctxMock),
      ).rejects.toThrow();
    });
  });

  describe('removeEmptyColums', () => {
    it('should remove falsy properties', () => {
      // Given
      const data = {
        foo: 'foovalue',
        bar: 'barvalue',
        wizz: false,
        buzz: undefined,
      };
      // When
      const result = service['removeEmptyColums'](data);
      // Then
      expect(result).toEqual({
        foo: 'foovalue',
        bar: 'barvalue',
      });
    });

    it('should remove empty string properties', () => {
      // Given
      const data = {
        foo: 'foovalue',
        bar: '',
        wizz: '',
      };
      // When
      const result = service['removeEmptyColums'](data);
      // Then
      expect(result).toEqual({
        foo: 'foovalue',
      });
    });
  });

  describe('getIdentity', () => {
    it('should return the correct idp', () => {
      // Given
      const entryA = { login: 'entryAValue', param: '1' };
      const entryB = { login: 'entryBValue', param: '1' };
      const entryC = { login: 'entryCValue', param: '1' };
      const expected = { sub: 'entryBValue', param: '1' };

      service['database'] = [entryA, entryB, entryC];
      const inputLogin = entryB.login;
      // When
      const result = service.getIdentity(inputLogin);

      // Then
      expect(result).toStrictEqual(expected);
    });

    it('should return undefined if not present', () => {
      // Given
      const entryA = { login: 'entryAValue', param: '1' };
      const entryB = { login: 'entryBValue', param: '1' };
      const entryC = { login: 'entryCValue', param: '1' };

      service['database'] = [entryA, entryB, entryC];
      const inputLogin = 'foo';
      // When
      const result = service.getIdentity(inputLogin);

      // Then
      expect(result).toStrictEqual(undefined);
    });
  });

  describe('toOidcFormat', () => {
    it('should replace the "login" property by "sub" and return the OidcClaims', () => {
      // setup
      const csvObject = {
        login: '42',
        key: 'value',
      };
      const expected = {
        sub: '42',
        key: 'value',
      };

      // action
      const result = service['toOidcFormat'](csvObject);

      //expect
      expect(result).toStrictEqual(expected);
    });

    it('should call oidcAddressFieldPresent with the current Csv', () => {
      // setup
      const csvObject = {
        login: '42',
        key: 'value',
      };
      const expected = {
        sub: '42',
        key: 'value',
      };
      service['oidcAddressFieldPresent'] = jest.fn();

      // action
      service['toOidcFormat'](csvObject);

      //expect
      expect(service['oidcAddressFieldPresent']).toHaveBeenCalledTimes(1);
      expect(service['oidcAddressFieldPresent']).toHaveBeenCalledWith(expected);
    });

    it('should not call "formatOidcAddress" if there is no address', () => {
      // setup
      const csvObject = {
        login: '42',
        key: 'value',
      };
      service['formatOidcAddress'] = jest.fn();

      // action
      service['toOidcFormat'](csvObject);

      //expect
      expect(service['formatOidcAddress']).toHaveBeenCalledTimes(0);
    });

    it('should call "formatOidcAddress" with the Csv containing the sub if there is an address', () => {
      // setup
      const csvObject = {
        login: '42',
        key: 'value',
        country: 'North Korea',
        // oidc claim
        // eslint-disable-next-line @typescript-eslint/naming-convention
        postal_code: '99999',
        locality: 'Pyongyang',
        // oidc claim
        // eslint-disable-next-line @typescript-eslint/naming-convention
        street_address: '1 st street',
      };
      const expected = {
        sub: '42',
        key: 'value',
        country: 'North Korea',
        // oidc claim
        // eslint-disable-next-line @typescript-eslint/naming-convention
        postal_code: '99999',
        locality: 'Pyongyang',
        // oidc claim
        // eslint-disable-next-line @typescript-eslint/naming-convention
        street_address: '1 st street',
      };
      service['formatOidcAddress'] = jest.fn();

      // action
      service['toOidcFormat'](csvObject);

      //expect
      expect(service['formatOidcAddress']).toHaveBeenCalledTimes(1);
      expect(service['formatOidcAddress']).toHaveBeenCalledWith(expected);
    });

    it('should return the OidcClaims object with the formatted address', () => {
      // setup
      const csvObject = {
        login: '42',
        key: 'value',
        country: 'North Korea',
        // oidc claim
        // eslint-disable-next-line @typescript-eslint/naming-convention
        postal_code: '99999',
        locality: 'Pyongyang',
        // oidc claim
        // eslint-disable-next-line @typescript-eslint/naming-convention
        street_address: '1 st street',
      };
      const expected = {
        sub: '42',
        key: 'value',
        address: {
          country: 'North Korea',
          // oidc claim
          // eslint-disable-next-line @typescript-eslint/naming-convention
          postal_code: '99999',
          locality: 'Pyongyang',
          // oidc claim
          // eslint-disable-next-line @typescript-eslint/naming-convention
          street_address: '1 st street',
        },
      };

      // action
      const result = service['toOidcFormat'](csvObject);

      //expect
      expect(result).toStrictEqual(expected);
    });

    it('should not alter the parameter', () => {
      // setup
      const csvObject = {
        login: '42',
        key: 'value',
      };
      const expected = {
        login: '42',
        key: 'value',
      };

      // action
      service['toOidcFormat'](csvObject);

      //expect
      expect(csvObject).toStrictEqual(expected);
    });
  });

  describe('oidcAddressFieldPresent', () => {
    it('should return true if the "country" field is present', () => {
      // setup
      const csvObject = {
        sub: '42',
        key: 'value',
        country: 'North Korea',
      };

      // action
      const result = service['oidcAddressFieldPresent'](csvObject);

      // expect
      expect(result).toBe(true);
    });

    it('should return true if the "postal_code" field is present', () => {
      // setup
      const csvObject = {
        sub: '42',
        key: 'value',
        // oidc claim
        // eslint-disable-next-line @typescript-eslint/naming-convention
        postal_code: '99999',
      };

      // action
      const result = service['oidcAddressFieldPresent'](csvObject);

      // expect
      expect(result).toBe(true);
    });

    it('should return true if the "locality" field is present', () => {
      // setup
      const csvObject = {
        sub: '42',
        key: 'value',
        locality: 'Pyongyang',
      };

      // action
      const result = service['oidcAddressFieldPresent'](csvObject);

      // expect
      expect(result).toBe(true);
    });

    it('should return true if the "street_address" field is present', () => {
      // setup
      const csvObject = {
        sub: '42',
        key: 'value',
        // oidc claim
        // eslint-disable-next-line @typescript-eslint/naming-convention
        street_address: '1 st street',
      };

      // action
      const result = service['oidcAddressFieldPresent'](csvObject);

      // expect
      expect(result).toBe(true);
    });
  });
});
