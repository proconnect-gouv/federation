import { RedisConfig } from '@fc/redis';

export default {
  host: process.env.FC_REDIS_HOST,
  port: process.env.FC_REDIS_PORT,
  password: process.env.FC_REDIS_PASSWORD,
  db: process.env.FC_REDIS_DB,
} as RedisConfig;
