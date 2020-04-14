import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;

  const redisMock = {
    on: jest.fn(),
    hgetall: jest.fn(),
    multi: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    hset: jest.fn(),
    ttl: jest.fn(),
    lrange: jest.fn(),
    del: jest.fn(),
  };

  const redisMockImplementation = (arg, cb) => {
    setTimeout(() => {
      cb(null, { arg });
    }, 0);
  };

  const redisMockError = new Error('redisMock Error');
  const redisMockImplementationReject = (arg, cb) => {
    setTimeout(() => {
      cb(redisMockError, null);
    }, 0);
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
  } as unknown) as LoggerService;

  const redisConfigMock = Symbol('redisConfigMock');
  const configServiceMock = {
    get: jest.fn(),
  };

  const redisProxy = {
    createClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService, LoggerService, ConfigService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<RedisService>(RedisService);

    service['client'] = redisMock;
    service['RedisProxy'] = redisProxy;

    jest.resetAllMocks();
    redisMock.hgetall.mockImplementation(redisMockImplementation);
    redisMock.get.mockImplementation(redisMockImplementation);
    redisMock.set.mockImplementation(redisMockImplementation);
    redisMock.hset.mockImplementation(redisMockImplementation);
    redisMock.ttl.mockImplementation(redisMockImplementation);
    redisMock.lrange.mockImplementation(redisMockImplementation);
    redisMock.del.mockImplementation(redisMockImplementation);

    configServiceMock.get.mockReturnValue(redisConfigMock);
    redisProxy.createClient.mockReturnValue(redisMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should fetch Redis config', () => {
      // When
      service.onModuleInit();
      // Then
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('Redis');
    });
    it('should create a redis client', () => {
      // When
      service.onModuleInit();
      // Then
      expect(redisProxy.createClient).toHaveBeenCalledTimes(1);
      expect(redisProxy.createClient).toHaveBeenCalledWith(redisConfigMock);
    });
    it('should log a debug success message ', () => {
      // When
      service.onModuleInit();
      // Then
      expect(loggerServiceMock.debug).toHaveBeenCalledTimes(1);
    });
  });

  describe('hgetall', () => {
    it('should call redis hgetall', async () => {
      // Given
      const arg1 = 'arg1';
      // When
      await service.hgetall(arg1);
      // Then
      expect(redisMock.hgetall).toHaveBeenCalledTimes(1);
    });

    it('should reject', async () => {
      // Given
      redisMock.hgetall.mockImplementation(redisMockImplementationReject);
      const arg1 = 'arg1';
      // Then
      expect(service.hgetall(arg1)).rejects.toThrow();
    });
  });

  describe('multi', () => {
    it('should call and return redis.multi', () => {
      // Given
      const multiReturn = Symbol('multiReturn');
      redisMock.multi.mockReturnValueOnce(multiReturn);
      // When
      const result = service.multi();
      // Then
      expect(redisMock.multi).toHaveBeenCalledTimes(1);
      expect(result).toBe(multiReturn);
    });
  });

  describe('get', () => {
    it('should call redis get', async () => {
      // When
      await service.get('foo');
      // Then
      expect(redisMock.get).toHaveBeenCalledTimes(1);
    });
    it('should resolve to redis get response', async () => {
      // When
      const result = await service.get('foo');
      // Then
      expect(result).toEqual({ arg: 'foo' });
    });
    it('should promisify get', async () => {
      // When
      const result = service.get('foo');
      // Then

      /**
       * Hacky check...
       * For some reason the below tests fails:
       * `expect(result).toBeInstanceOf(Promise);`
       * or
       * `expect(result isntanceof Promise).toBe(true);`
       *
       * @see https://stackoverflow.com/questions/58029714/jests-expectvalue-tobeinstanceofclass-fails-for-expectutil-promisify
       */
      expect(result.constructor.name).toBe('Promise');
      // End clean
      await result;
    });
  });

  describe('set', () => {
    it('should call redis set', async () => {
      // When
      await service.set('foo');
      // Then
      expect(redisMock.set).toHaveBeenCalledTimes(1);
    });
    it('should resolve to redis set response', async () => {
      // When
      const result = await service.set('foo');
      // Then
      expect(result).toEqual({ arg: 'foo' });
    });
    it('should promisify set', async () => {
      // When
      const result = service.set('foo');
      // Then

      /**
       * Hacky check...
       * For some reason the below tests fails:
       * `expect(result).toBeInstanceOf(Promise);`
       * or
       * `expect(result isntanceof Promise).toBe(true);`
       *
       * @see https://stackoverflow.com/questions/58029714/jests-expectvalue-tobeinstanceofclass-fails-for-expectutil-promisify
       */
      expect(result.constructor.name).toBe('Promise');
      // End clean
      await result;
    });
  });

  describe('hset', () => {
    it('should call redis hset', async () => {
      // When
      await service.hset('foo');
      // Then
      expect(redisMock.hset).toHaveBeenCalledTimes(1);
    });
    it('should resolve to redis hset response', async () => {
      // When
      const result = await service.hset('foo');
      // Then
      expect(result).toEqual({ arg: 'foo' });
    });
    it('should promisify hset', async () => {
      // When
      const result = service.hset('foo');
      // Then

      /**
       * Hacky check...
       * For some reason the below tests fails:
       * `expect(result).toBeInstanceOf(Promise);`
       * or
       * `expect(result isntanceof Promise).toBe(true);`
       *
       * @see https://stackoverflow.com/questions/58029714/jests-expectvalue-tobeinstanceofclass-fails-for-expectutil-promisify
       */
      expect(result.constructor.name).toBe('Promise');
      // End clean
      await result;
    });
  });

  describe('ttl', () => {
    it('should call redis ttl', async () => {
      // When
      await service.ttl('foo');
      // Then
      expect(redisMock.ttl).toHaveBeenCalledTimes(1);
    });
    it('should resolve to redis ttl response', async () => {
      // When
      const result = await service.ttl('foo');
      // Then
      expect(result).toEqual({ arg: 'foo' });
    });
    it('should promisify ttl', async () => {
      // When
      const result = service.ttl('foo');
      // Then

      /**
       * Hacky check...
       * For some reason the below tests fails:
       * `expect(result).toBeInstanceOf(Promise);`
       * or
       * `expect(result isntanceof Promise).toBe(true);`
       *
       * @see https://stackoverflow.com/questions/58029714/jests-expectvalue-tobeinstanceofclass-fails-for-expectutil-promisify
       */
      expect(result.constructor.name).toBe('Promise');
      // End clean
      await result;
    });
  });

  describe('lrange', () => {
    it('should call redis lrange', async () => {
      // When
      await service.lrange('foo');
      // Then
      expect(redisMock.lrange).toHaveBeenCalledTimes(1);
    });
    it('should resolve to redis lrange response', async () => {
      // When
      const result = await service.lrange('foo');
      // Then
      expect(result).toEqual({ arg: 'foo' });
    });
    it('should promisify lrange', async () => {
      // When
      const result = service.lrange('foo');
      // Then

      /**
       * Hacky check...
       * For some reason the below tests fails:
       * `expect(result).toBeInstanceOf(Promise);`
       * or
       * `expect(result isntanceof Promise).toBe(true);`
       *
       * @see https://stackoverflow.com/questions/58029714/jests-expectvalue-tobeinstanceofclass-fails-for-expectutil-promisify
       */
      expect(result.constructor.name).toBe('Promise');
      // End clean
      await result;
    });
  });

  describe('del', () => {
    it('should call redis del', async () => {
      // When
      await service.del('foo');
      // Then
      expect(redisMock.del).toHaveBeenCalledTimes(1);
    });
    it('should resolve to redis del response', async () => {
      // When
      const result = await service.del('foo');
      // Then
      expect(result).toEqual({ arg: 'foo' });
    });
    it('should promisify del', async () => {
      // When
      const result = service.del('foo');
      // Then

      /**
       * Hacky check...
       * For some reason the below tests fails:
       * `expect(result).toBeInstanceOf(Promise);`
       * or
       * `expect(result isntanceof Promise).toBe(true);`
       *
       * @see https://stackoverflow.com/questions/58029714/jests-expectvalue-tobeinstanceofclass-fails-for-expectutil-promisify
       */
      expect(result.constructor.name).toBe('Promise');
      // End clean
      await result;
    });
  });
});
