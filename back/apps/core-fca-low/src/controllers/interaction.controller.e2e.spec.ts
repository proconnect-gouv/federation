import * as request from 'supertest';
import { join } from 'path';
import * as CookieParser from 'cookie-parser';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
// import { CatsService } from '../../src/cats/cats.service';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@fc/config';
// import config from '../config';
import { CoreFcaConfig } from '@fc/core';
import { get } from 'lodash';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { LogLevels } from '@fc/logger';
import { jean } from '../../../.mock/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { renderFile } from 'ejs';
import type { SessionConfig } from '@fc/session';

describe.only('Cats', () => {
  let app: NestExpressApplication;
  let mongoServer: MongoMemoryReplSet;
  beforeAll(async () => {
    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });

    const configService = {
      configuration: {
        ...jean.jean,
        Mongoose: {
          uri: mongoServer.getUri(),
        } as any,
      } as any,
      get(path) {
        return get(this.configuration, path);
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule.forRoot(configService as any)],
    })
      //   .overrideProvider(CatsService)
      //   .useValue(catsService)
      .compile();

    app = moduleRef.createNestApplication();

    app.engine('ejs', renderFile);
    app.setViewEngine('ejs');
    app.set(
      'views',
      jean.jean.App.viewsPaths.map((viewsPath) => {
        return join(__dirname, '..', viewsPath, 'views');
      }),
    );
    const { cookieSecrets } = configService.get('Session');
    app.use(CookieParser(cookieSecrets));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  it(`GET /authorize`, () => {
    return request(app.getHttpServer()).get('/authorize').expect(400);
  });
});
