import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { REDIS_CONNECTION_TOKEN } from '@fc/redis';
import {
  SessionBadFormatException,
  SessionNotFoundException,
  SessionBadSessionIdException,
} from './exceptions';
import { SessionService } from './session.service';
import { ISession } from './interfaces';

describe('SessionService', () => {
  let service: SessionService;

  const loggerServiceMock = ({
    setContext: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
  } as unknown) as LoggerService;

  const configServiceMock = {
    get: jest.fn(),
  };

  const redisGetReturnValueMock = 'redisGetReturnValueMock';
  const redisMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const cryptographyPrefixMock = 'my_prefix::';

  const cryptographyKeyMock = 'cryptographyKeyMock';
  const cryptographySessionIdMock = 'my Session Id';
  const cryptographyServiceMock = {
    encryptSymetric: jest.fn(),
    decryptSymetric: jest.fn(),
    genSessionId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        LoggerService,
        ConfigService,
        CryptographyService,
        {
          provide: REDIS_CONNECTION_TOKEN,
          useValue: redisMock,
        },
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<SessionService>(SessionService);

    jest.resetAllMocks();

    configServiceMock.get.mockReturnValue({
      cryptographyKey: cryptographyKeyMock,
      prefix: cryptographyPrefixMock,
      interactionCookieName: 'interactionCookieName_value',
      sessionCookieName: 'sessionCookieName_value',
    });

    cryptographyServiceMock.encryptSymetric.mockReturnValue('encryptSymetric');
    cryptographyServiceMock.decryptSymetric.mockReturnValue('{"foo": "bar"}');
    cryptographyServiceMock.genSessionId.mockReturnValue(
      cryptographySessionIdMock,
    );

    redisMock.get.mockResolvedValue(redisGetReturnValueMock);
    redisMock.set.mockResolvedValue('OK');

    service['cryptoKey'] = cryptographyKeyMock;
    service['prefix'] = cryptographyPrefixMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call config of module', () => {
      // When
      service.onModuleInit();
      // Then
      expect(configServiceMock.get).toHaveBeenLastCalledWith('Session');
    });
    it('should set private properties', () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        cryptographyKey: 'test_cryptographyKeyMock',
        prefix: 'test_cryptographyPrefixMock',
      });
      // When
      service.onModuleInit();
      // Then
      expect(service['prefix']).toBe('test_cryptographyPrefixMock');
      expect(service['cryptoKey']).toBe('test_cryptographyKeyMock');
    });
  });

  describe('serialize', () => {
    // Given
    const dataMock = { foo: 'bar' };

    it('should call encryption service', () => {
      // Given
      const stringifiedData = '{"foo":"bar"}';
      // When
      service['serialize'](dataMock);
      // Then
      expect(cryptographyServiceMock.encryptSymetric).toHaveBeenCalledWith(
        cryptographyKeyMock,
        stringifiedData,
      );
    });
    it('should return result of encryption', () => {
      // When
      const result = service['serialize'](dataMock);
      // Then
      expect(result).toEqual('encryptSymetric');
    });
  });

  describe('unserialize', () => {
    // Given
    const dataMock = 'fake encrypted dataMock';

    it('should call decryption service', () => {
      // When
      service['unserialize'](dataMock);
      // Then
      expect(cryptographyServiceMock.decryptSymetric).toHaveBeenCalledWith(
        cryptographyKeyMock,
        dataMock,
      );
    });
    it('should return result of decryption', () => {
      // When
      const result = service['unserialize'](dataMock);
      // Then
      expect(result).toEqual({ foo: 'bar' });
    });
    it('should throw if identity is not parsable JSON', () => {
      // Given
      cryptographyServiceMock.decryptSymetric.mockResolvedValue('not json');
      // Then
      expect(() => {
        service['unserialize'](dataMock);
      }).toThrow(SessionBadFormatException);
    });
  });

  describe('getKey', () => {
    it('should concatenate prefix and given key', () => {
      // Given
      const input = 'foo';
      // When
      const result = service['getKey'](input);
      // Then
      expect(result).toBe(`${cryptographyPrefixMock}${input}`);
    });
  });

  describe('store', () => {
    const key = 'key';
    const dataMock = ({
      interactionId: 'bar',
      idpId: '1337',
    } as unknown) as ISession;

    it('should call serialize with dataMock', async () => {
      // Given
      service['serialize'] = jest.fn();
      // When
      await service['store'](key, dataMock);
      // Then
      expect(service['serialize']).toHaveBeenCalledTimes(1);
      expect(service['serialize']).toHaveBeenCalledWith(dataMock);
    });
    it('should call redis set with serialize result', async () => {
      // Given
      const serializeResult = Symbol('serialized result');
      service['serialize'] = jest.fn().mockReturnValue(serializeResult);
      // When
      await service['store'](key, dataMock);
      // Then
      expect(redisMock.set).toHaveBeenCalledWith(
        `${cryptographyPrefixMock}${key}`,
        serializeResult,
      );
    });
    it('should return true if set was successfull', async () => {
      // When
      const res = await service['store'](key, dataMock);
      // Then
      expect(res).toEqual(true);
    });
    it('should return false if set was NOT successfull', async () => {
      // Given
      redisMock.set.mockResolvedValue(null);
      // When
      const res = await service['store'](key, dataMock);
      // Then
      expect(res).toEqual(false);
    });
  });

  describe('get', () => {
    const key = 'key';

    it('should call redis get with key', async () => {
      // When
      await service['get'](key);
      // Then
      expect(redisMock.get).toHaveBeenCalledWith(
        `${cryptographyPrefixMock}${key}`,
      );
    });
    it('should call unserialize with dataMock from redis get', async () => {
      // Given
      service['unserialize'] = jest.fn();
      // When
      await service['get'](key);
      // Then
      expect(service['unserialize']).toHaveBeenCalledWith(
        redisGetReturnValueMock,
      );
    });
    it('should return value of unserialize', async () => {
      // Given
      const returnOfUnserialize = Symbol('returnOfUnserialize');
      service['unserialize'] = jest.fn().mockReturnValue(returnOfUnserialize);
      // When
      const result = await service['get'](key);
      // Then
      expect(result).toBe(returnOfUnserialize);
    });
    it('should throw if identity is not found in redis', async () => {
      // Given
      redisMock.get.mockResolvedValue(false);
      // Then
      await expect(service['get'](key)).rejects.toThrow(
        SessionNotFoundException,
      );
    });
  });
  describe('delete', () => {
    const key = 'key';

    it('should call redis del with key', async () => {
      // When
      await service['delete'](key);
      // Then
      expect(redisMock.del).toHaveBeenCalledWith(
        `${cryptographyPrefixMock}${key}`,
      );
    });
    it('should not throw if identity is not found in redis', async () => {
      // Given
      redisMock.del.mockResolvedValue(null);
      // Then
      await expect(service['delete'](key)).resolves.not.toThrow();
    });
  });

  describe('set', () => {
    const key = 'key';
    it('should update existing sesion', async () => {
      // Given
      const originalSession = {
        a: 'A',
        b: 'B',
      };
      service.get = jest.fn().mockReturnValueOnce(originalSession);
      service.store = jest.fn();
      const input = ({ b: 'C' } as unknown) as ISession;
      // When
      await service.set(key, input);
      // Then
      expect(service.store).toHaveBeenCalledTimes(1);
      expect(service.store).toHaveBeenCalledWith(key, {
        a: 'A',
        b: 'C',
      });
    });
  });

  describe('setCookie', () => {
    it('should get options from config and call res.cookie with it', () => {
      // Given
      const cookieOptionsMock = {};
      configServiceMock.get.mockReturnValueOnce({
        cookieOptions: cookieOptionsMock,
      });
      const cookieName = 'foo';
      const cookieValue = 'bar';
      const resMock = {
        cookie: jest.fn(),
      };
      // When
      service.setCookie(resMock, cookieName, cookieValue);
      // Then
      expect(resMock.cookie).toHaveBeenCalledTimes(1);
      expect(resMock.cookie).toHaveBeenCalledWith(
        cookieName,
        cookieValue,
        cookieOptionsMock,
      );
    });
  });

  describe('init', () => {
    it('should get data and store it', () => {
      // Given
      const resMock = {
        cookie: jest.fn(),
      };
      const interactionIdMock = 'foo';
      const propertiesMock = {
        spId: 'mySpId',
        spAcr: 'eidas3',
        spName: 'My SP',
      };
      service['store'] = jest.fn();
      // When
      service.init(resMock, interactionIdMock, propertiesMock);
      // Then
      expect(service['store']).toHaveBeenCalledTimes(1);
      expect(service['store']).toHaveBeenCalledWith(interactionIdMock, {
        ...propertiesMock,
        sessionId: cryptographySessionIdMock,
      });
    });
    it('should set cookies for session and interaction', () => {
      // Given
      const resMock = {
        cookie: jest.fn(),
      };
      const interactionIdMock = 'foo';
      const propertiesMock = {
        spId: 'mySpId',
        spAcr: 'eidas3',
        spName: 'My SP',
      };
      service['setCookie'] = jest.fn();
      service['store'] = jest.fn();
      // When
      service.init(resMock, interactionIdMock, propertiesMock);
      // Then
      expect(service['setCookie']).toHaveBeenCalledTimes(2);
      expect(service['setCookie']).toHaveBeenCalledWith(
        resMock,
        'interactionCookieName_value',
        'foo',
      );
      expect(service['setCookie']).toHaveBeenCalledWith(
        resMock,
        'sessionCookieName_value',
        cryptographySessionIdMock,
      );
    });
  });

  describe('verify', () => {
    it('should throw if session is not found by interactionId', () => {
      // Given
      const error = Error('some error');
      const interactionIdMock = 'foo';
      const sessionIdMock = 'bar';
      service['get'] = jest.fn().mockRejectedValue(error);
      // Then
      expect(service.verify(interactionIdMock, sessionIdMock)).rejects.toThrow(
        error,
      );
    });
    it('should throw if sessionId is not in session found by interactionId', () => {
      // Given
      const interactionIdMock = 'foo';
      const sessionIdMock = 'bar';
      service['get'] = jest.fn().mockResolvedValue({ sessionId: 'not bar' });
      // Then
      expect(service.verify(interactionIdMock, sessionIdMock)).rejects.toThrow(
        SessionBadSessionIdException,
      );
    });
    it('should not throw if sessionId is in session found by interactionId', () => {
      // Given
      const interactionIdMock = 'foo';
      const sessionIdMock = 'bar';
      service['get'] = jest.fn().mockResolvedValue({ sessionId: 'bar' });
      // Then
      expect(
        service.verify(interactionIdMock, sessionIdMock),
      ).resolves.not.toThrow();
    });
  });
});
