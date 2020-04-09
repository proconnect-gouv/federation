import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;

  const redisMock = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const redisMockImplementation = (arg, cb) => {
    setTimeout(() => {
      cb(null, { arg });
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
    redisMock.get.mockImplementation(redisMockImplementation);
    redisMock.set.mockImplementation(redisMockImplementation);
    configServiceMock.get.mockReturnValue(redisConfigMock);
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
});
