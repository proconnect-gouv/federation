import { UnauthorizedException } from "@nestjs/common";
import { AuthenticatedMiddleware } from "./authenticated.middleware";

describe("AuthenticatedMiddleware", () => {
  const authenticatedMiddleware = new AuthenticatedMiddleware();

  it("lets the request pass if the request holds a user", () => {
    const req = {
      user: Symbol("user"),
    };
    const res = jest.fn();
    const next = jest.fn();

    authenticatedMiddleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("sends an UnauthenticatedException if no user is found on the request", () => {
    const req = {};
    const res = jest.fn();
    const next = jest.fn();

    expect(() => authenticatedMiddleware.use(req, res, next)).toThrow(
      UnauthorizedException,
    );
  });
});
