import * as request from 'supertest';
import { TestingBench } from '@fc/core/test-bench';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ServiceProviderAdapterMongoService,
  type ServiceProvider,
} from '@fc/service-provider-adapter-mongo';

describe('InteractionController', () => {
  it(`GET /`, async () => {
    await using bench = await TestingBench.createTestBench();
    const { app } = bench;

    await request(app.getHttpServer())
      .get('/')
      .expect(301)
      .expect('Location', 'https://www.proconnect.gouv.fr');
  });

  it('GET /interaction/:uid', async () => {
    await using bench = await TestingBench.createTestBench();
    const { app, redis } = bench;
    const serviceProviderAdapterMongoService = app.get(
      ServiceProviderAdapterMongoService,
    );

    const ServiceProviderModel = app.get<Model<ServiceProvider>>(
      getModelToken('ServiceProvider'),
    );
    await ServiceProviderModel.create({
      active: true,
      client_id: 'test-sp-id',
      client_secret:
        '+sqGL4XE6aqzIMOp/DKC1jWB8I+8qE1jW6iz2tUv8lt+ZZzxjyoCBQeuAcJTFZxfLywkn6cAICK5JPLxYM0+8pk/q7CGHUfr/gzr3ZYRroWWE+egEEDxqRYDYe0=',
      id_token_signed_response_alg: 'ES256',
      key: 'test-service-provider-key',
      name: 'Test Service Provider',
      post_logout_redirect_uris: ['https://example.com/logout'],
      redirect_uris: ['https://example.com/callback'],
      scopes: ['openid', 'profile', 'email'],
      title: 'Test SP',
      type: 'public',
    });

    await serviceProviderAdapterMongoService.refreshCache();

    await redis.set(
      'OIDC-P:Interaction:1234567890-1234567890',
      JSON.stringify({
        uid: '1234567890-1234567890',
        params: {
          client_id: 'test-service-provider-key',
          state: 'test-state',
          scope: 'openid profile email',
        },
        prompt: {
          name: 'login',
          reasons: [],
        },
      }),
    );

    await request(app.getHttpServer())
      .get('/interaction/1234567890-1234567890')
      .set('Cookie', '_interaction=1234567890-1234567890')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(({ text }) => {
        expect(text).toContain('Choix du compte - ProConnect');
        expect(text).toContain('Se connecter à Test Service Provider');
      });
  });
});
