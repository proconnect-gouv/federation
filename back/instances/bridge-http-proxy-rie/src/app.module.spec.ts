import { Test } from '@nestjs/testing';

import { ConfigService } from '@fc/config';

import { getConfigMock } from '@mocks/config';

import { AppModule } from './app.module';

describe('AppModule (bridge-http-proxy-rie)', () => {
  it('should compile the module correctly', async () => {
    const configServiceMock = getConfigMock();
    const configValues = {
      Logger: { threshold: 'info' },
      Session: {
        cookie: {
          secrets: ['test-secret'],
        },
        middlewareExcludedRoutes: [],
        middlewareIncludedRoutes: [],
      },
    };
    configServiceMock.get.mockImplementation(
      (key: keyof typeof configValues) => configValues[key] || null,
    );

    const moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule.forRoot(configServiceMock as unknown as ConfigService),
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    expect(moduleFixture).toBeDefined();
    expect(app).toBeDefined();

    await app.close();
  });
});
