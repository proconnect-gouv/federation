import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { Identity } from '../dto';
import { ServiceProviderAdapterEnvService } from '@fc/service-provider-adapter-env';
import { SessionService } from '@fc/session';
import { OidcProviderService } from '@fc/oidc-provider';
import { MockIdentityProviderService } from './mock-identity-provider.service';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        OidcProviderService,
        MockIdentityProviderService,
        ServiceProviderAdapterEnvService,
        SessionService,
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
    it('Should call csvdb library', async () => {
      // Given
      service['csvdbProxy'] = jest.fn().mockResolvedValue({
        rows: [{ foo: 'foo' }],
      }); // When
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
      const data = ({
        foo: 'foovalue',
        bar: 'barvalue',
        wizz: false,
        buzz: undefined,
      } as unknown) as Identity;
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
      const data = ({
        foo: 'foovalue',
        bar: '',
        wizz: '',
      } as unknown) as Identity;
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
      const entryA = { uid: 'entryAValue' };
      const entryB = { uid: 'entryBValue' };
      const entryC = { uid: 'entryCValue' };

      service['database'] = [entryA, entryB, entryC] as Identity[];
      const inputUid = entryB.uid;
      // When
      const result = service.getIdentity(inputUid);

      // Then
      expect(result).toBe(entryB);
    });

    it('should return undefined if not present', () => {
      // Given
      const entryA = { uid: 'entryAValue' };
      const entryB = { uid: 'entryBValue' };
      const entryC = { uid: 'entryCValue' };

      service['database'] = [entryA, entryB, entryC] as Identity[];
      const inputUid = 'foo';
      // When
      const result = service.getIdentity(inputUid);

      // Then
      expect(result).toBe(undefined);
    });

    it('should return extra properties if user is E020025', () => {
      // Given
      const entryA = { uid: 'E020025' };
      const resultMock = {
        ...entryA,
        // oidc naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        unknown_prop_for_test: 'shouldNotBeThere',
      };

      service['database'] = [entryA] as Identity[];
      const inputUid = entryA.uid;
      // When
      const result = service.getIdentity(inputUid);

      // Then
      expect(result).toStrictEqual(resultMock);
    });
  });
});
