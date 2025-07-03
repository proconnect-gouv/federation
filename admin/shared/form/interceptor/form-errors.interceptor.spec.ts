import { BadRequestException } from '@nestjs/common';
import { throwError } from 'rxjs';
import { FormErrorsInterceptor } from './form-errors.interceptor';

describe('FormErrorsInterceptor', () => {
  const urlTemplate = '/yolo/croute';
  const dto = jest.fn();

  const request = {
    body: dto,
    csrfToken: jest.fn(),
    flash: jest.fn(),
    totp: 'valid',
  };
  const response = {
    locals: {
      APP_ROOT: '/foo/bar',
    },
    redirect: jest.fn(),
  };

  const executionContext = {
    switchToHttp: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    getHandler: jest.fn(),
    getType: jest.fn(),
  };
  const callHandler = {
    handle: () =>
      throwError(
        new BadRequestException([
          {
            property: 'password',
            constraints: {
              length: 'Length',
              strength: 'Strength',
            },
          },
          {
            property: 'age',
            constraints: {
              minimum: 'Minimum',
            },
          },
        ]),
      ),
  };
  const formErrorsInterceptor = new FormErrorsInterceptor(urlTemplate);

  beforeEach(() => {
    jest.resetAllMocks();

    request.csrfToken.mockReturnValue('ThIs_Is_A_cSrF_tOkEn');

    executionContext.switchToHttp.mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
      getResponse: jest.fn().mockReturnValue(response),
    });

    request.totp = 'valid';
  });

  it("should redirect to the provided url with errors sent by Nest's built-in ValidationPipe when there is no totp", done => {
    // setup
    delete request.totp;

    const expectedFirstFlashCallArgs = {
      password: ['Length', 'Strength'],
      age: ['Minimum'],
    };

    const expectedSecondFlashCallArgs = dto;

    // action
    formErrorsInterceptor
      .intercept(executionContext, callHandler)
      .subscribe(result => {
        // expect
        expect(request.flash).toHaveBeenCalledTimes(2);
        expect(request.flash).toHaveBeenCalledWith(
          'errors',
          expectedFirstFlashCallArgs,
        );
        expect(request.flash).toHaveBeenCalledWith(
          'values',
          expectedSecondFlashCallArgs,
        );
        expect(response.redirect).toHaveBeenCalledTimes(1);
        expect(response.redirect).toHaveBeenCalledWith(
          `/foo/bar${urlTemplate}`,
        );
        done();
      });
  });

  it('should complete the template url with the rights params', done => {
    // setup
    const specialRequest = {
      params: {
        id: 'incredible-id',
        anotherParam: 'why+not',
      },
      body: dto,
      csrfToken: jest.fn(),
      flash: jest.fn(),
    };

    const specialFormErrorsInterceptor = new FormErrorsInterceptor(
      `${urlTemplate}/:id/:anotherParam`,
    );

    executionContext.switchToHttp.mockReturnValue({
      getRequest: jest.fn().mockReturnValue(specialRequest),
      getResponse: jest.fn().mockReturnValue(response),
    });

    const expectedFirstFlashCallArgs = {
      password: ['Length', 'Strength'],
      age: ['Minimum'],
    };

    const expectedSecondFlashCallArgs = dto;

    // action
    specialFormErrorsInterceptor
      .intercept(executionContext, callHandler)
      .subscribe(result => {
        // expect
        expect(specialRequest.flash).toHaveBeenCalledTimes(2);
        expect(specialRequest.flash).toHaveBeenCalledWith(
          'errors',
          expectedFirstFlashCallArgs,
        );
        expect(specialRequest.flash).toHaveBeenCalledWith(
          'values',
          expectedSecondFlashCallArgs,
        );
        expect(response.redirect).toHaveBeenCalledTimes(1);
        expect(response.redirect).toHaveBeenCalledWith(
          `/foo/bar${urlTemplate}/incredible-id/why+not`,
        );
        done();
      });
  });

  it("should redirect to the provided url with errors sent by Nest's built-in ValidationPipe when totp is valid", done => {
    // setup
    const expectedFirstFlashCallArgs = {
      password: ['Length', 'Strength'],
      age: ['Minimum'],
    };

    const expectedSecondFlashCallArgs = dto;

    // action
    formErrorsInterceptor
      .intercept(executionContext, callHandler)
      .subscribe(result => {
        // expect
        expect(request.flash).toHaveBeenCalledTimes(2);
        expect(request.flash).toHaveBeenCalledWith(
          'errors',
          expectedFirstFlashCallArgs,
        );
        expect(request.flash).toHaveBeenCalledWith(
          'values',
          expectedSecondFlashCallArgs,
        );
        expect(response.redirect).toHaveBeenCalledTimes(1);
        expect(response.redirect).toHaveBeenCalledWith(
          `/foo/bar${urlTemplate}`,
        );
        done();
      });
  });

  it('should redirect to the provided url with totp errors when totp is invalid', () => {
    // setup
    request.totp = 'invalid';

    const expectedFirstFlashCallArgs = {
      _totp: ["Le TOTP saisi n'est pas valide"],
    };

    const expectedSecondFlashCallArgs = dto;

    // action
    formErrorsInterceptor.intercept(executionContext, callHandler);

    // expect
    expect(request.flash).toHaveBeenCalledTimes(2);
    expect(request.flash).toHaveBeenCalledWith(
      'errors',
      expectedFirstFlashCallArgs,
    );
    expect(request.flash).toHaveBeenCalledWith(
      'values',
      expectedSecondFlashCallArgs,
    );
    expect(response.redirect).toHaveBeenCalledTimes(1);
    expect(response.redirect).toHaveBeenCalledWith(`/foo/bar${urlTemplate}`);
  });
});
