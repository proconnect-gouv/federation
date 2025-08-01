import { AuthenticatedMiddleware } from './authenticated.middleware';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthenticatedMiddleware', () => {
  const authenticatedMiddleware = new AuthenticatedMiddleware();

  it('lets the request pass if the request holds a user', () => {
    const req = {
      user: Symbol('user'),
    };
    const res = jest.fn();
    const next = jest.fn();

    authenticatedMiddleware.use(req, res, next);

    expect(next).toBeCalledTimes(1);
  });

  it('sends an UnauthenticatedException if no user is found on the request', () => {
    const req = {};
    const res = jest.fn();
    const next = jest.fn();

    expect(() => authenticatedMiddleware.use(req, res, next)).toThrow(
      UnauthorizedException,
    );
  });
});
