import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { Identity } from '../dto';
import { MockIdentityProviderFcaService } from './mock-identity-provider-fca.service';

describe('MockIdentityProviderFcaService', () => {
  let service: MockIdentityProviderFcaService;

  const loggerMock = {
    debug: jest.fn(),
    fatal: jest.fn(),
    setContext: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService, MockIdentityProviderFcaService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    service = module.get<MockIdentityProviderFcaService>(
      MockIdentityProviderFcaService,
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
  });
});
