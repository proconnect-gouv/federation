import { Test } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { getConfigMock } from '@mocks/config';

import { AppModule } from './app.module';

describe('AppModule (bridge-http-proxy-rie)', () => {
  it('should compile the module correctly', async () => {
    const configServiceMock = getConfigMock();
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'Logger') {
        return { threshold: 'info' };
      }
      if (key === 'Broker_URLS') {
        return ['amqp://localhost:5672'];
      }
      if (key === 'Broker_QUEUE') {
        return 'test-queue';
      }
      if (key === 'SessionModule') {
        return {
          cookie: {
            secrets: ['test-secret'],
          },
        };
      }
      return null;
    });

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
