import { RequestMethod } from "@nestjs/common";
import { isString, ValidateBy, ValidationOptions } from "class-validator";

export const IS_MIDDLEWARE_ROUTE = "IsMiddlewareRoute";

function isRouteInfo(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const { path, method } = value as { path: unknown; method: unknown };

  return (
    isString(path) && typeof method === "number" && method in RequestMethod
  );
}

export function isMiddlewareRoute(value: unknown): boolean {
  return isString(value) || value instanceof RegExp || isRouteInfo(value);
}

export class IsMiddlewareRouteConstraint {
  // proxy function
  /* istanbul ignore next */
  validate(value: unknown): boolean {
    return isMiddlewareRoute(value);
  }

  defaultMessage() {
    return "The value must be a string, a RegExp or a RouteInfo";
  }
}

// declarative code
/* istanbul ignore next */
export function IsMiddlewareRoute(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  // declarative code
  /* istanbul ignore next */
  return ValidateBy(
    {
      name: IS_MIDDLEWARE_ROUTE,
      constraints: [],
      validator: new IsMiddlewareRouteConstraint(),
    },
    validationOptions,
  );
}
