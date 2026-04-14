import { ConfigModule, ConfigService } from "@fc/config";
import { LoggerModule, LoggerService } from "@fc/logger";
import { getConfigMock } from "@mocks/config";
import { getLoggerMock } from "@mocks/logger";
import { Injectable, type OnModuleInit } from "@nestjs/common";
import {
  getModelToken,
  InjectModel,
  Prop,
  Schema,
  SchemaFactory,
} from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { get } from "lodash";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { Document, Model } from "mongoose";
import { MongooseCollectionOperationWatcherHelper } from "./helpers";
import { MongooseModule } from "./mongoose.module";

const loggerMock = getLoggerMock();
const configServiceMock = getConfigMock();

//

@Schema()
class Cat extends Document {
  @Prop()
  name: string;
}
const CatSchema = SchemaFactory.createForClass(Cat);

//

@Injectable()
class TestWatcherService implements OnModuleInit {
  cache = [] as string[];
  constructor(
    @InjectModel(Cat.name)
    private readonly catModel: Model<Cat>,
    private readonly mongooseWatcher: MongooseCollectionOperationWatcherHelper,
  ) {}

  async getNameList() {
    const cats = await this.catModel.find();
    return cats.map(({ name }) => name);
  }

  onModuleInit() {
    this.mongooseWatcher.watchWith<Cat>(this.catModel, async () => {
      this.cache = await this.getNameList();
    });
  }
}

describe("MongooseProvider with MongoMemoryReplSet", () => {
  it("should properly cleanup ChangeStreams when module is destroyed", async () => {
    await using mongo = await MongoMemoryReplSet.create({
      replSet: { count: 1 },
    });
    const configService = {
      configuration: {
        Logger: {
          threshold: "debug",
        },
        Mongoose: {
          uri: mongo.getUri(),
          watcherDebounceWaitDuration: 0,
        },
      },
      get(path) {
        return get(this.configuration, path);
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(),
        MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
        ConfigModule.forRoot(configServiceMock as any),
        LoggerModule.forRoot([]),
      ],
      providers: [TestWatcherService],
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    await using bench = {
      app: await moduleRef.init(),
      async [Symbol.asyncDispose]() {
        await this.app.close();
      },
    };
    const { app } = bench;

    const service = app.get(TestWatcherService);
    expect(service.cache).toEqual([]);

    // The Model change : Felix le chat arrive ;)
    const CatModel = app.get<Model<Cat>>(getModelToken(Cat.name));

    // Insert and retry until the watcher captures the event. The ChangeStream
    // cursor is opened asynchronously after onModuleInit; an insert that lands
    // before the aggregate round-trip completes will be missed permanently.
    for (let attempt = 1; attempt <= 5; attempt++) {
      await CatModel.create({ name: "Felix" });
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (service.cache.includes("Felix")) break;
    }

    // The service did play cache-cache with Felix le chat ;)
    expect(service.cache).toContain("Felix");
  });

  it("should properly reconnect the watchers after mongo reconnection", async () => {
    await using mongo = await MongoMemoryReplSet.create({
      replSet: { count: 1 },
    });

    const configService = {
      configuration: {
        Logger: {
          threshold: "debug",
        },
        Mongoose: {
          uri: mongo.getUri(),
          watcherDebounceWaitDuration: 0,
        },
      },
      get(path) {
        return get(this.configuration, path);
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(),
        MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
        ConfigModule.forRoot(configServiceMock as any),
        LoggerModule.forRoot([]),
      ],
      providers: [TestWatcherService],
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    await using bench = {
      app: await moduleRef.init(),
      async [Symbol.asyncDispose]() {
        await this.app.close();
      },
    };
    const { app } = bench;

    const service = app.get(TestWatcherService);
    const CatModel = app.get<Model<Cat>>(getModelToken(Cat.name));
    expect(service.cache).toEqual([]);

    // Simulate a disconnection by closing and reopening the connection
    const connection = CatModel.db;
    await connection.close();
    await connection.openUri(mongo.getUri());

    // Retry until the watcher captures an insert, proving it is operational.
    for (let attempt = 1; attempt <= 5; attempt++) {
      await CatModel.create({ name: "Felix" });
      await new Promise((r) => setTimeout(r, 300));
      if (service.cache.includes("Felix")) break;
    }
    // The service did play cache-cache with Felix le chat ;)
    expect(service.cache).toContain("Felix");
  });
});
