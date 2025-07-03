import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { LocalsInterceptor } from './meta/locals.interceptor';

describe('AppController', () => {
  let appController: AppController;
  let localsInterceptor: LocalsInterceptor;

  const localsInterceptorMock = {
    intercept: jest.fn(),
  };

  const req = {
    user: {
      roles: [],
    },
    csrfToken: function csrfToken() {
      return 'mygreatcsrftoken';
    },
  };
  const res = {
    redirect: jest.fn(),
    locals: {
      APP_ROOT: '/foo/bar',
    },
  };
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [LocalsInterceptor],
    })
      .overrideProvider(LocalsInterceptor)
      .useValue(localsInterceptorMock)
      .compile();

    appController = module.get<AppController>(AppController);
    localsInterceptor = module.get<LocalsInterceptor>(LocalsInterceptor);

    jest.resetAllMocks();
  });

  describe('index', () => {
    it('should redirect the user who is a new user to the enrollment page', async () => {
      // setup
      req.user.roles = ['inactive_admin', 'new_account'];
      // action
      await appController.index(req, res);
      // assertion
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/account/enrollment`,
      );
    });
    it('should redirect the user who is not an operator to the service provider page', async () => {
      // setup
      req.user.roles = ['operator'];
      // action
      await appController.index(req, res);
      // assertion
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/service-provider`,
      );
    });

    it('should redirect the user who is an admin to the account page', async () => {
      // setup
      req.user.roles = ['admin'];
      // action
      await appController.index(req, res);
      // assertion
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `${res.locals.APP_ROOT}/account`,
      );
    });
  });
});
