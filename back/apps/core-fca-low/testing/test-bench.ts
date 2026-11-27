import CookieParser from "cookie-parser";
import { renderFile } from "ejs";
import type Redis from "ioredis";
import MockRedis from "ioredis-mock";
import { get } from "lodash";
import { MongoClient } from "mongodb";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { join } from "node:path";
import request from "supertest";

import type { NestExpressApplication } from "@nestjs/platform-express";
import type { TestingModuleBuilder } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { NestJsDependencyInjectionWrapper } from "#libs/common";
import type { ConfigService } from "#libs/config";
import { IdentityProviderAdapterMongoService } from "#libs/identity-provider-adapter-mongo";
import { OidcClientService } from "#libs/oidc-client";
import { RedisService } from "#libs/redis";
import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";
import type { SessionConfig } from "#libs/session";
import { IdentityProvidersMock } from "#mocks/oidc-client";

import { accountsFca } from "#seed/account-fca";
import { identityProviders } from "#seed/identity-providers";
import { resourceServers } from "#seed/resource-servers";
import { serviceProviders } from "#seed/service-providers";
import TEST_CONFIG from "../.mocks/config";
import { AppModule } from "../src/app.module";
import type { AppConfig } from "../src/dto";
import type { AuthorizeQuery } from "./service-provider-session";
import { ServiceProviderSession } from "./service-provider-session";

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

    app.engine("ejs", renderFile);
    app.setViewEngine("ejs");
    const { viewsPaths } = configService.get<AppConfig>("App");
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

    await app.init();

    const client = await MongoClient.connect(mongo.getUri());
    const db = client.db();
    await db.collection("accountFca").insertMany(Object.values(accountsFca));
    await db
      .collection("client")
      .insertMany(Object.values({ ...resourceServers, ...serviceProviders }));
    await db
      .collection("provider")
      .insertMany(Object.values(identityProviders));
    await client.close();
    await app.get(ServiceProviderAdapterMongoService).refreshCache();
    await app.get(IdentityProviderAdapterMongoService).refreshCache();
    const identityProvidersMock = new IdentityProvidersMock(
      Object.values(identityProviders),
    );
    app.get(OidcClientService).fetch = identityProvidersMock.fetch;

    return new TestingBench(
      app,
      configService as any,
      identityProvidersMock,
      mongo,
      redis,
    );
  }

  constructor(
    readonly app: NestExpressApplication,
    readonly config: ConfigService,
    readonly identityProviders: IdentityProvidersMock,
    readonly mongo: MongoMemoryReplSet,
    readonly redis: Redis,
  ) {}

  get request() {
    return request(this.app.getHttpServer());
  }

  get serviceProviders() {
    return Object.fromEntries(
      Object.keys(serviceProviders).map((name) => [
        name,
        (query?: AuthorizeQuery) =>
          new ServiceProviderSession(
            this,
            name as keyof typeof serviceProviders,
            query,
          ),
      ]),
    ) as {
      [Name in keyof typeof serviceProviders]: (
        query?: AuthorizeQuery,
      ) => ServiceProviderSession;
    };
  }

  async [Symbol.asyncDispose]() {
    await this.app.close();
    await this.mongo.stop();
    this.redis.disconnect();
  }
}
