/* istanbul ignore file */

// Tested by DTO
import { RedisConfig } from '@fc/redis';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'Redis');

export default {
  host: env.string('HOST'),
  port: env.number('PORT'),
  password: env.string('PASSWORD'),
  db: env.number('DB'),
} as RedisConfig;
