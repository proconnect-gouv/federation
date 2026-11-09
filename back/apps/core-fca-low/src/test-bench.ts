import CookieParser from "cookie-parser";
import { renderFile } from "ejs";
import type Redis from "ioredis";
import MockRedis from "ioredis-mock";
import { get } from "lodash";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import request from "supertest";

import type { NestExpressApplication } from "@nestjs/platform-express";
import type { TestingModuleBuilder } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { NestJsDependencyInjectionWrapper } from "#libs/common";
import type { ConfigService } from "#libs/config";
import { RedisService } from "#libs/redis";
import type { SessionConfig } from "#libs/session";

import TEST_CONFIG from "../.mocks/config";
import { AppModule } from "./app.module";
import type { AppConfig } from "./dto";

export class TestingBench {
  static async createTestBench(
    configureModule?: (builder: TestingModuleBuilder) => TestingModuleBuilder,
    configOverrides: Partial<typeof TEST_CONFIG> = {},
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
        // the bench serves plain http, where clients do not send Secure cookies
        Session: {
          ...TEST_CONFIG.Session,
          cookieOptions: {
            ...TEST_CONFIG.Session.cookieOptions,
            secure: false,
          },
        },
        ...configOverrides,
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

    if (configureModule) {
      moduleBuilder = configureModule(moduleBuilder);
    }

    const moduleRef = await moduleBuilder.compile();

    const app = moduleRef.createNestApplication<NestExpressApplication>();

    const { urlPrefix, viewsPaths } = configService.get<AppConfig>("App");
    app.setGlobalPrefix(urlPrefix);
    app.engine("ejs", renderFile);
    app.setViewEngine("ejs");
    app.set(
      "views",
      viewsPaths.map((viewsPath) => {
        return join(__dirname, viewsPath, "views");
      }),
    );

    const { cookieSecrets } = configService.get<SessionConfig>("Session");
    const appModule = AppModule.forRoot(configService as any);
    app.use(CookieParser(cookieSecrets));
    NestJsDependencyInjectionWrapper.use(app.select(appModule));

    // listen on a real port: oidc-provider sends absolute redirections
    // built from the request host, that must reach the bench back
    await app.listen(0, "127.0.0.1");
    const { port } = app.getHttpServer().address() as AddressInfo;

    return new TestingBench(
      app,
      configService as any,
      mongo,
      redis,
      `http://127.0.0.1:${port}`,
    );
  }

  constructor(
    readonly app: NestExpressApplication,
    readonly config: ConfigService,
    readonly mongo: MongoMemoryReplSet,
    readonly redis: Redis,
    readonly url: string,
  ) {}

  /**
   * A cookie-keeping http client, that accepts the paths and the `Location`
   * headers sent by the app (relative or absolute) as is.
   */
  agent() {
    // the empty base url lets the plugin below resolve every url against the bench
    return request.agent("").use((req) => {
      req.url = new URL(req.url, this.url).href;
    });
  }

  async [Symbol.asyncDispose]() {
    await this.app.close();
    await this.mongo.stop();
    this.redis.disconnect();
  }
}
