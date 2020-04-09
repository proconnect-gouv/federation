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
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  onModuleInit() {
    const config = this.configService.get<RedisConfig>('Redis');
    /**
     * @TODO handle connection loss
     * (app should recover if connexion is cut and comes back)
     */
    this.client = this.RedisProxy.createClient(config);

    this.logger.debug('Initialized new Redis client');
  }

  /**
   * Getter to give access to a promisified `redis.get()` method
   *
   * @returns async redis.get
   */
  get get(): Function {
    return promisify(this.client.get).bind(this.client);
  }

  /**
   * Getter to give access to a promisified `redis.set()` method
   *
   * @returns async redis.set
   */
  get set(): Function {
    return promisify(this.client.set).bind(this.client);
  }
}
