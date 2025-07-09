import { AllExceptionFilter } from './all-exception.filter';
import { ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { LoggerService } from '@fc/shared/logger/logger.service';

describe('AllExceptionFilter', () => {
  const configurationMock = {
    environment: 'development',
    app_root: '/foo/bar',
    commitUrlPrefix: 'commitUrlPrefix',
    currentBranch: 'currentBranch',
    latestCommitShortHash: 'latestCommitShortHash',
    latestCommitLongHash: 'latestCommitLongHash',
  };

  const loggerMock = {
    info: jest.fn(),
    error: jest.fn(),
  };

  let exceptionFilter: AllExceptionFilter;

  beforeEach(() => {
    jest.resetAllMocks();

    exceptionFilter = new AllExceptionFilter(
      configurationMock,
      (loggerMock as unknown) as LoggerService,
    );

    Date.now = jest.fn().mockReturnValue(1570007990164);
  });

  it('Should catch an error 500 - internal server error', () => {
    const render = jest.fn();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({
      render,
      json,
    });
    const url = jest.fn();
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          status,
        }),
        getRequest: jest.fn().mockReturnValue({
          url,
        }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
    };

    exceptionFilter.catch(
      HttpStatus.INTERNAL_SERVER_ERROR,
      host as ArgumentsHost,
    );

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(500);
    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledWith('exception/500.ejs', {
      APP_ROOT: '/foo/bar',
      APP_ENVIRONMENT: 'development',
      GIT_CURRENT_BRANCH: 'currentBranch',
      COMMIT_URL_PREFIX: 'commitUrlPrefix',
      GIT_LATEST_COMMIT_LONG_HASH: 'latestCommitLongHash',
      GIT_LATEST_COMMIT_SHORT_HASH: 'latestCommitShortHash',
    });
  });

  it('Should catch an error 413 - entity too large error', () => {
    const render = jest.fn();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({
      render,
      json,
    });
    const url = jest.fn();
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          status,
        }),
        getRequest: jest.fn().mockReturnValue({
          url,
        }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
    };

    exceptionFilter.catch(
      new HttpException('', HttpStatus.PAYLOAD_TOO_LARGE),
      host as ArgumentsHost,
    );

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(413);
    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledWith('exception/413.ejs', {
      APP_ROOT: '/foo/bar',
      APP_ENVIRONMENT: 'development',
      GIT_CURRENT_BRANCH: 'currentBranch',
      COMMIT_URL_PREFIX: 'commitUrlPrefix',
      GIT_LATEST_COMMIT_LONG_HASH: 'latestCommitLongHash',
      GIT_LATEST_COMMIT_SHORT_HASH: 'latestCommitShortHash',
    });
  });

  it('Should catch an error 404 - page not found error', () => {
    const render = jest.fn();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({
      render,
      json,
    });
    const url = jest.fn();
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          status,
        }),
        getRequest: jest.fn().mockReturnValue({
          url,
        }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
    };

    exceptionFilter.catch(
      new HttpException('', HttpStatus.NOT_FOUND),
      host as ArgumentsHost,
    );

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(404);
    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledWith('exception/404.ejs', {
      APP_ROOT: '/foo/bar',
      APP_ENVIRONMENT: 'development',
      GIT_CURRENT_BRANCH: 'currentBranch',
      COMMIT_URL_PREFIX: 'commitUrlPrefix',
      GIT_LATEST_COMMIT_LONG_HASH: 'latestCommitLongHash',
      GIT_LATEST_COMMIT_SHORT_HASH: 'latestCommitShortHash',
    });
  });

  it('Should catch an error 403 - forbidden error', () => {
    const render = jest.fn();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({
      render,
      json,
    });
    const url = jest.fn();
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          status,
        }),
        getRequest: jest.fn().mockReturnValue({
          url,
        }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
    };

    exceptionFilter.catch(
      new HttpException('', HttpStatus.FORBIDDEN),
      host as ArgumentsHost,
    );

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(403);
    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledWith('exception/403.ejs', {
      APP_ROOT: '/foo/bar',
      APP_ENVIRONMENT: 'development',
      GIT_CURRENT_BRANCH: 'currentBranch',
      COMMIT_URL_PREFIX: 'commitUrlPrefix',
      GIT_LATEST_COMMIT_LONG_HASH: 'latestCommitLongHash',
      GIT_LATEST_COMMIT_SHORT_HASH: 'latestCommitShortHash',
    });
  });

  it('Should catch an error 401 - unauthorized error', () => {
    const redirect = jest.fn();
    const render = jest.fn();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({
      render,
      json,
    });
    const url = jest.fn();
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          status,
          redirect,
        }),
        getRequest: jest.fn().mockReturnValue({
          url,
        }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
    };

    exceptionFilter.catch(
      new HttpException('', HttpStatus.UNAUTHORIZED),
      host as ArgumentsHost,
    );

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith('/foo/bar/login');
  });

  it('Should catch an error 400 - bad request error', () => {
    const render = jest.fn();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({
      render,
      json,
    });
    const url = jest.fn();
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          status,
        }),
        getRequest: jest.fn().mockReturnValue({
          url,
        }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
    };

    exceptionFilter.catch(
      new HttpException('', HttpStatus.BAD_REQUEST),
      host as ArgumentsHost,
    );

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(400);
    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledWith('exception/400.ejs', {
      APP_ROOT: '/foo/bar',
      APP_ENVIRONMENT: 'development',
      GIT_CURRENT_BRANCH: 'currentBranch',
      COMMIT_URL_PREFIX: 'commitUrlPrefix',
      GIT_LATEST_COMMIT_LONG_HASH: 'latestCommitLongHash',
      GIT_LATEST_COMMIT_SHORT_HASH: 'latestCommitShortHash',
    });
  });

  it('Should catch an unknown error', () => {
    const render = jest.fn();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({
      render,
      json,
    });
    const url = '/url/foo/bar';
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          status,
        }),
        getRequest: jest.fn().mockReturnValue({
          url,
        }),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
    };

    exceptionFilter.catch(
      new HttpException('', HttpStatus.EXPECTATION_FAILED),
      host as ArgumentsHost,
    );

    expect(status).toHaveBeenCalledTimes(1);
    expect(json).toHaveBeenCalledTimes(1);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.EXPECTATION_FAILED,
      timestamp: 1570007990164,
      path: '/url/foo/bar',
    });
  });
});
