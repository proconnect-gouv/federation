import { LoggerService } from '@fc/logger';
import { RedisService } from '@fc/redis';
import { OidcProviderService } from '@fc/oidc-provider';
import { RedisAdapter, REDIS_PREFIX } from './redis.adapter';
import {
  OidcProviderStringifyPayloadForRedisException,
  OidcProviderParseRedisResponseException,
} from '../exceptions';

describe('RedisAdapter', () => {
  let adapter;

  const loggerMock = ({
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  } as unknown) as LoggerService;

  const redisMock = {
    hgetall: jest.fn(),
    get: jest.fn(),
    multi: jest.fn(),
    hset: jest.fn(),
    ttl: jest.fn(),
    lrange: jest.fn(),
    del: jest.fn(),
  };

  const multiMock = {
    hmset: jest.fn(),
    set: jest.fn(),
    expire: jest.fn(),
    rpush: jest.fn(),
    exec: jest.fn(),
    del: jest.fn(),
  };

  const throwErrorMock = jest.fn();

  const testAdapterName = 'testAdapterName';

  beforeEach(() => {
    adapter = new RedisAdapter(
      loggerMock,
      (redisMock as unknown) as RedisService,
      throwErrorMock,
      testAdapterName,
    );

    jest.resetAllMocks();
    redisMock.multi.mockReturnValue(multiMock);
    redisMock.ttl.mockResolvedValue(42);
    redisMock.lrange.mockResolvedValue(['a', 'b', 'c']);
    multiMock.exec.mockImplementation(cb => cb());
  });

  describe('constructor', () => {
    it('should set Name and logger context', () => {
      // when
      new RedisAdapter(
        loggerMock,
        (redisMock as unknown) as RedisService,
        throwErrorMock,
        testAdapterName,
      );
      // Then
      expect(loggerMock.setContext).toHaveBeenCalledTimes(1);
      expect(loggerMock.setContext).toHaveBeenCalledWith('RedisAdapter');
      expect(adapter.contextName).toBe(testAdapterName);
    });
  });

  describe('getConstructorWithDI', () => {
    // Given
    const nameMock = 'foo';
    const oidcProviderService = ({
      logger: loggerMock,
      redisService: redisMock,
      throwError: throwErrorMock,
    } as unknown) as OidcProviderService;
    const BoundClass = RedisAdapter.getConstructorWithDI(oidcProviderService);

    it('should pass controls in oidc-provider', () => {
      /**
       * @see https://github.com/panva/node-oidc-provider/blob/master/lib/helpers/initialize_adapter.js#L13
       */
      // Then
      expect(BoundClass.prototype).toBeDefined();
      expect(BoundClass.prototype.constructor).toBeDefined();
      expect(BoundClass.prototype.constructor.name).toBeDefined();
    });

    it('Should return an instantiable class', () => {
      // When
      const result = new BoundClass(nameMock);
      // Then
      expect(result).toBeInstanceOf(RedisAdapter);
    });
    it('Should return an object having injected services', () => {
      // When
      const result = new BoundClass(nameMock) as any;
      // Then
      expect(result.logger).toBe(loggerMock);
      expect(result.redisService).toBe(redisMock);
    });
    it('Should return an object having original argument handled', () => {
      // When
      const result = new BoundClass(nameMock) as any;
      // Then
      expect(result.contextName).toBe(nameMock);
    });
  });

  describe('upsert', () => {
    // Given
    const idMock = 'foo';
    const defaultPayload = {};
    const expiresIn = 6000;

    it('should call hmset if name is in consumable var', async () => {
      // Given
      const authorizationCodeAdapter = new RedisAdapter(
        loggerMock,
        (redisMock as unknown) as RedisService,
        throwErrorMock,
        'AuthorizationCode',
      );
      // When
      await authorizationCodeAdapter.upsert(idMock, defaultPayload, expiresIn);
      // Then
      expect(multiMock.set).toHaveBeenCalledTimes(0);
      expect(multiMock.hmset).toHaveBeenCalledTimes(1);
      expect(multiMock.hmset).toHaveBeenCalledWith(
        `${REDIS_PREFIX}:AuthorizationCode:foo`,
        {
          payload: '{}',
        },
      );
    });
    it('should call set if name is not in consumable var', async () => {
      // When
      await adapter.upsert(idMock, defaultPayload, expiresIn);
      // Then
      expect(multiMock.hmset).toHaveBeenCalledTimes(0);
      expect(multiMock.set).toHaveBeenCalledTimes(1);
      expect(multiMock.set).toHaveBeenCalledWith(
        `${REDIS_PREFIX}:testAdapterName:foo`,
        '{}',
      );
    });
    it('should throw if expires is not a number', async () => {
      // Given
      const expires = 'not a number';
      // When
      await adapter.upsert(idMock, defaultPayload, expires);
      // Then
      expect(throwErrorMock).toHaveBeenCalledTimes(1);
      expect(throwErrorMock).toHaveBeenCalledWith(expect.any(TypeError));
    });
    it('should call expires if expiresIn is provided', async () => {
      // When
      await adapter.upsert(idMock, defaultPayload, expiresIn);
      // Then
      expect(multiMock.expire).toHaveBeenCalledTimes(1);
    });
    it('should not call expires if expiresIn is not provided', async () => {
      // When
      await adapter.upsert(idMock, defaultPayload);
      // Then
      expect(multiMock.expire).toHaveBeenCalledTimes(0);
    });
    it('should call rpush for grantId', async () => {
      // Given
      const payload = { grantId: 'grantId' };
      // When
      await adapter.upsert(idMock, payload);
      // Then
      expect(multiMock.rpush).toHaveBeenCalledTimes(1);
      expect(multiMock.rpush).toHaveBeenCalledWith(
        `${REDIS_PREFIX}:grant:grantId`,
        `${REDIS_PREFIX}:testAdapterName:foo`,
      );
    });
    it('should call set for userCode', async () => {
      // Given
      const payload = { userCode: 'userCode' };
      // When
      await adapter.upsert(idMock, payload);
      // Then
      expect(multiMock.set).toHaveBeenCalledTimes(2);
      expect(multiMock.set).toHaveBeenCalledWith(
        `${REDIS_PREFIX}:testAdapterName:foo`,
        '{"userCode":"userCode"}',
      );
    });
    it('should call set for uid', async () => {
      // Given
      const payload = { uid: 'uid' };
      // When
      await adapter.upsert(idMock, payload);
      // Then
      expect(multiMock.set).toHaveBeenCalledTimes(2);
      expect(multiMock.set).toHaveBeenCalledWith(
        `${REDIS_PREFIX}:testAdapterName:foo`,
        '{"uid":"uid"}',
      );
    });
    it('should call set and expires for all properties', async () => {
      // Given
      const payload = {
        grantId: 'grantId',
        userCode: 'userCode',
        uid: 'uid',
      };
      const SET_CALL_COUNT = 3;
      const RPUSH_CALL_COUNT = 1;
      const EXPIRE_CALL_COUNT = 4;
      // When
      await adapter.upsert(idMock, payload, expiresIn);
      // Then
      expect(multiMock.set).toHaveBeenCalledTimes(SET_CALL_COUNT);
      expect(multiMock.rpush).toHaveBeenCalledTimes(RPUSH_CALL_COUNT);
      expect(multiMock.expire).toHaveBeenCalledTimes(EXPIRE_CALL_COUNT);
    });
    it('should throw an error if exec fails ', async () => {
      // Given
      const error = new Error('exec failed');
      multiMock.exec.mockImplementationOnce(cb => cb(error));
      // Then
      expect(adapter.upsert(idMock, defaultPayload)).rejects.toThrow(error);
    });
    it('Should throw if JSON.stringiy fails', async () => {
      // Given
      const payload = { foo: 'bar', circularRef: null };
      payload.circularRef = payload;
      // When
      await adapter.upsert(idMock, payload);
      // Then
      expect(throwErrorMock).toHaveBeenCalledTimes(1);
      expect(throwErrorMock).toHaveBeenCalledWith(
        expect.any(OidcProviderStringifyPayloadForRedisException),
      );
    });
  });

  describe('find', () => {
    it('should call hgetall rather than get if name is in consumable var', async () => {
      // Given
      const authorizationCodeAdapter = new RedisAdapter(
        loggerMock,
        (redisMock as unknown) as RedisService,
        throwErrorMock,
        'AuthorizationCode',
      );
      const idMock = 'foo';
      // When
      await authorizationCodeAdapter.find(idMock);
      // Then
      expect(redisMock.hgetall).toHaveBeenCalledTimes(1);
      expect(redisMock.hgetall).toHaveBeenCalledWith(
        `${REDIS_PREFIX}:AuthorizationCode:foo`,
      );
      expect(redisMock.get).toHaveBeenCalledTimes(0);
    });

    it('should call get rather than hgetall if name is in consumable var', async () => {
      // Given
      const idMock = 'foo';
      // When
      await adapter.find(idMock);
      // Then
      expect(redisMock.get).toHaveBeenCalledTimes(1);
      expect(redisMock.get).toHaveBeenCalledWith(
        `${REDIS_PREFIX}:testAdapterName:foo`,
      );
      expect(redisMock.hgetall).toHaveBeenCalledTimes(0);
    });
    it('should return undefined if response is empty', async () => {
      // Given
      const idMock = 'foo';
      redisMock.get.mockResolvedValue(null);
      // When
      const result = await adapter.find(idMock);
      // Then
      expect(result).toBe(undefined);
    });
    it('should return an object parsed from JSON if response is a string', async () => {
      // Given
      const idMock = 'foo';
      redisMock.get.mockResolvedValue('{"foo":"bar"}');
      // When
      const result = await adapter.find(idMock);
      // Then
      expect(result).toEqual({ foo: 'bar' });
    });
    it('should return a merged object if response is an object', async () => {
      // Given
      const idMock = 'foo';
      redisMock.get.mockResolvedValue({
        payload: '{"fizz":"buzz"}',
        foo: 'bar',
      });
      // When
      const result = await adapter.find(idMock);
      // Then
      expect(result).toEqual({ fizz: 'buzz', foo: 'bar' });
    });
    it('should throw if raw response can not be JSON parsed', async () => {
      // Given
      const idMock = 'foo';
      redisMock.get.mockResolvedValue('not so much json');
      // Then
      await expect(adapter.find(idMock)).rejects.toThrow(
        OidcProviderParseRedisResponseException,
      );
    });
    it('should throw if structured response can not be JSON parsed', async () => {
      // Given
      const idMock = 'foo';
      redisMock.get.mockResolvedValue({ payload: 'not json either' });
      // Then
      await expect(adapter.find(idMock)).rejects.toThrow(
        OidcProviderParseRedisResponseException,
      );
    });
  });

  describe('findByUid', () => {
    it('should call find with the result of redis.get', async () => {
      // Given
      const idMock = 'foo';
      adapter.find = jest.fn();
      const redisGetResolvedValue = Symbol('redisGetResolvedValue');
      redisMock.get.mockResolvedValueOnce(redisGetResolvedValue);
      // When
      await adapter.findByUid(idMock);
      // Then
      expect(redisMock.get).toHaveBeenCalledTimes(1);
      expect(redisMock.get).toHaveBeenCalledWith(`${REDIS_PREFIX}:uid:foo`);
      expect(adapter.find).toHaveBeenCalledTimes(1);
      expect(adapter.find).toHaveBeenCalledWith(redisGetResolvedValue);
    });
  });

  describe('findByUserCode', () => {
    it('should call find with the result of redis.get', async () => {
      // Given
      const idMock = 'foo';
      adapter.find = jest.fn();
      const redisGetResolvedValue = Symbol('redisGetResolvedValue');
      redisMock.get.mockResolvedValueOnce(redisGetResolvedValue);
      // When
      await adapter.findByUserCode(idMock);
      // Then
      expect(redisMock.get).toHaveBeenCalledTimes(1);
      expect(redisMock.get).toHaveBeenCalledWith(
        `${REDIS_PREFIX}:userCode:foo`,
      );
      expect(adapter.find).toHaveBeenCalledTimes(1);
      expect(adapter.find).toHaveBeenCalledWith(redisGetResolvedValue);
    });
  });

  describe('destroy', () => {
    it('should call del', async () => {
      // Given
      const idMock = 'foo';
      // When
      await adapter.destroy(idMock);
      // Then
      expect(redisMock.del).toHaveBeenCalledTimes(1);
      expect(redisMock.del).toHaveBeenCalledWith(
        `${REDIS_PREFIX}:testAdapterName:foo`,
      );
    });
  });

  describe('revokeByGrantId', () => {
    it('should call redis multi', async () => {
      // Given
      const idMock = 'foo';
      // When
      await adapter.revokeByGrantId(idMock);
      // Then
      expect(redisMock.multi).toHaveBeenCalledTimes(1);
    });
    it('should call redis lrange', async () => {
      // Given
      const idMock = 'foo';
      // When
      await adapter.revokeByGrantId(idMock);
      // Then
      expect(redisMock.lrange).toHaveBeenCalledTimes(1);
    });
    it('should call muti.del for each token found by lrange and one time for grant', async () => {
      // Given
      const idMock = 'foo';
      const CALL_COUNT = 4; // 3 items returned + the grant
      // When
      await adapter.revokeByGrantId(idMock);
      // Then
      expect(multiMock.del).toHaveBeenCalledTimes(CALL_COUNT);
    });
    it('should throw an error if exec fails ', async () => {
      // Given
      const idMock = 'foo';
      const errorMock = new Error('exec failed');
      multiMock.exec.mockImplementationOnce(cb => cb(errorMock));
      // Then
      expect(adapter.revokeByGrantId(idMock)).rejects.toThrow(errorMock);
    });
  });

  describe('consume', () => {
    it('should cann redis.hset', async () => {
      // Given
      const idMock = 'foo';
      // When
      await adapter.consume(idMock);
      // Then
      expect(redisMock.hset).toHaveBeenCalledTimes(1);
      expect(redisMock.hset).toHaveBeenCalledWith(
        `${REDIS_PREFIX}:testAdapterName:foo`,
        'consumed',
        expect.any(Number),
      );
    });
  });
});
