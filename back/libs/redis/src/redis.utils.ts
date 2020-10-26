/* istanbul ignore file */

import { RedisModuleOptions } from './interfaces/redis.interfaces';
import * as Redis from 'ioredis';

export const createRedisConnection = ({
  config,
}: RedisModuleOptions): Redis.Redis => new Redis(config);
