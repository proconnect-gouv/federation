import { Test } from '@nestjs/testing';
import { AppContextMiddleware } from './app-context.middleware';
import { ConfigService } from 'nestjs-config';

describe('AppContextMiddleware', () => {
  let appContextMiddleware;
  const configService = {
    get: jest.fn().mockReturnValue({
      app_root: '/foo/bar',
    }),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AppContextMiddleware, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();
    appContextMiddleware = await module.get<AppContextMiddleware>(
      AppContextMiddleware,
    );
  });

  it('injects the APP_ROOT variable to response locals', () => {
    const req = {};
    const res = {
      locals: {},
    };
    const next = jest.fn();
    appContextMiddleware.use(req, res, next);
    expect(res.locals).toMatchObject({
      APP_ROOT: '/foo/bar',
    });
    expect(next).toBeCalledTimes(1);
  });
});
