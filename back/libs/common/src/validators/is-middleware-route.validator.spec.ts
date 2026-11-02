import { RequestMethod } from "@nestjs/common";
import {
  isMiddlewareRoute,
  IsMiddlewareRouteConstraint,
} from "./is-middleware-route.validator";

describe("IsMiddlewareRouteConstraint", () => {
  describe("isMiddlewareRoute", () => {
    it("should return true if the value is a string", () => {
      // action
      const result = isMiddlewareRoute("a string");

      // expect
      expect(result).toStrictEqual(true);
    });

    it("should return true if the value is a RegExp", () => {
      // action
      const result = isMiddlewareRoute(/RegExp/);

      // expect
      expect(result).toStrictEqual(true);
    });

    it("should return true if the value is a RouteInfo", () => {
      // action
      const result = isMiddlewareRoute({
        path: "/path",
        method: RequestMethod.GET,
      });

      // expect
      expect(result).toStrictEqual(true);
    });

    it("should return false if the value is a RouteInfo with an unknown method", () => {
      // action
      const result = isMiddlewareRoute({ path: "/path", method: "GET" });

      // expect
      expect(result).toStrictEqual(false);
    });

    it("should return false if the value is neither a string, a RegExp or a RouteInfo", () => {
      // action
      const result = isMiddlewareRoute(42);

      // expect
      expect(result).toStrictEqual(false);
    });
  });

  describe("defaultMessage", () => {
    it("should return the default message", () => {
      // setup
      const instance = new IsMiddlewareRouteConstraint();

      // action
      const result = instance.defaultMessage();

      // expect
      expect(result).toStrictEqual(
        "The value must be a string, a RegExp or a RouteInfo",
      );
    });
  });
});
