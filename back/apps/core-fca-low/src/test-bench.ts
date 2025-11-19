import * as CookieParser from 'cookie-parser';
import { renderFile } from 'ejs';
import type Redis from 'ioredis';
import MockRedis from 'ioredis-mock';
import { get } from 'lodash';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { join } from 'node:path';

import type { NestExpressApplication } from '@nestjs/platform-express';
import type { TestingModuleBuilder } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { NestJsDependencyInjectionWrapper } from '@fc/common';
import type { ConfigService } from '@fc/config';
import { RedisService } from '@fc/redis';
import type { SessionConfig } from '@fc/session';

import TEST_CONFIG from '../.mocks/config';
import { AppModule } from './app.module';
import type { AppConfig } from './dto';

//

export class TestingBench {
  static async createTestBench(
    configureModule?: (builder: TestingModuleBuilder) => TestingModuleBuilder,
  ) {
    // NOTE(douglasduteil): a MongoMemoryReplSet is required to use mongo Change Streams
    // ```
    // Unhandled error. (MongoServerError: The $changeStream stage is only supported on replica sets
    //   at Connection.sendCommand (node_modules/mongodb/src/cmap/connection.ts:559:17)
    //   ...
    // see https://www.mongodb.com/docs/v8.0/changeStreams/#availability
    const mongo = await MongoMemoryReplSet.create({
      replSet: { count: 1 },
    });
    const redis = new MockRedis();

    const configService = {
      configuration: {
        ...TEST_CONFIG,
        Mongoose: {
          uri: mongo.getUri(),
        },
      },
      get<T>(path: string): T {
        return get(this.configuration, path);
      },
    };

    let moduleBuilder = Test.createTestingModule({
      imports: [AppModule.forRoot(configService as any)],
    })
      .overrideProvider(RedisService)
      .useValue({
        client: redis,
        onModuleInit: () => {},
        onModuleDestroy: () => redis.disconnect(),
      });

    // Allow test-specific module configuration
    if (configureModule) {
      moduleBuilder = configureModule(moduleBuilder);
    }

    const moduleRef = await moduleBuilder.compile();

    const app = moduleRef.createNestApplication<NestExpressApplication>();

    app.engine('ejs', renderFile);
    app.setViewEngine('ejs');
    const { viewsPaths } = configService.get<AppConfig>('App');
    app.set(
      'views',
      viewsPaths.map((viewsPath) => {
        return join(__dirname, viewsPath, 'views');
      }),
    );

    const { cookieSecrets } = configService.get<SessionConfig>('Session');
    const appModule = AppModule.forRoot(configService as any);
    app.use(CookieParser(cookieSecrets));
    NestJsDependencyInjectionWrapper.use(app.select(appModule));

    await app.init();

    return new TestingBench(app, configService as any, mongo, redis);
  }
  //
  constructor(
    readonly app: NestExpressApplication,
    readonly config: ConfigService,
    readonly mongo: MongoMemoryReplSet,
    readonly redis: Redis,
  ) {}

  async [Symbol.asyncDispose]() {
    await this.app.close();
    await this.mongo.stop();
    this.redis.disconnect();
  }
}
