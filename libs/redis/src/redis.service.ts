import { promisify } from 'util';
import { Injectable } from '@nestjs/common';
import * as Redis from 'redis';
import { ConfigService } from '@fc/config';
import { RedisConfig } from './dto';
import { LoggerService } from '@fc/logger';

@Injectable()
export class RedisService {
  private RedisProxy = Redis;
  private client: Redis.RedisClient;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  onModuleInit() {
    const config = this.config.get<RedisConfig>('Redis');
    /**
     * @TODO handle connection loss
     * (app should recover if connexion is cut and comes back)
     */
    this.client = this.RedisProxy.createClient(config);

    this.logger.debug('Initialized new Redis client');
  }

  private promisifyMethod(methodName) {
    return promisify(this.client[methodName]).bind(this.client);
  }

  /**
   * Promisified `redis.hgetall()` method
   *
   * This function ca return multiple response elements,
   * so it does not fit the (err, response) pattern awaited by promisify
   */
  hgetall(...args: string[]) {
    return new Promise((resolve, reject) => {
      const callback = (error: Error, ...response: Array<string | Buffer>) => {
        if (error) {
          reject(error);
        }

        resolve(...response);
      };

      this.client.hgetall(...args, callback);
    });
  }

  /**
   * Getter to give access to `redis.multi()` method
   *
   * This is not promisified since this is not an async function.
   * multi does not to any actual call to redis until `multi.exec()` is called.
   *
   * Not that `multi.exec()` expects a callback.
   * @returns async redis.multi
   */
  get multi(): Function {
    return this.client.multi.bind(this.client);
  }

  /**
   * Getter to give access to a promisified `redis.get()` method
   * @returns async redis.get
   */
  get get(): Function {
    return this.promisifyMethod('get');
  }

  /**
   * Getter to give access to a promisified `redis.set()` method
   * @returns async redis.set
   */
  get set(): Function {
    return this.promisifyMethod('set');
  }

  /**
   * Getter to give access to a promisified `redis.hset()` method
   * @returns async redis.hset
   */
  get hset(): Function {
    return this.promisifyMethod('hset');
  }

  /**
   * Getter to give access to a promisified `redis.ttl()` method
   * @returns async redis.ttl
   */
  get ttl(): Function {
    return this.promisifyMethod('ttl');
  }

  /**
   * Getter to give access to a promisified `redis.lrange()` method
   * @returns async redis.lrange
   */
  get lrange(): Function {
    return this.promisifyMethod('lrange');
  }

  /**
   * Getter to give access to a promisified `redis.del()` method
   * @returns async redis.del
   */
  get del(): Function {
    return this.promisifyMethod('del');
  }
}
