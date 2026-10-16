import {
  buildMessage,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  isURL,
  ValidateBy,
} from "class-validator";

import { JSONWebKeySet } from "jose";

function IsCallbackUrl(): PropertyDecorator {
  return ValidateBy({
    name: "isCallbackUrl",
    validator: {
      defaultMessage: buildMessage(
        (eachPrefix, { object }) =>
          `${eachPrefix}$property must be an ${(object as OidcClientConfig).isHttpAllowed ? "http or https" : "https"} URL`,
      ),
      validate: (value, { object }) =>
        isURL(value, {
          protocols: (object as OidcClientConfig).isHttpAllowed
            ? ["http", "https"]
            : ["https"],
          require_protocol: true,
        }),
    },
  });
}

export class OidcClientConfig {
  @IsNumber()
  readonly timeout: number;

  @IsOptional()
  @IsObject()
  readonly jwks?: JSONWebKeySet;

  @IsOptional()
  @IsBoolean()
  readonly isHttpAllowed?: boolean;

  @IsCallbackUrl()
  readonly redirectUri: string;

  @IsCallbackUrl()
  readonly postLogoutRedirectUri: string;

  @IsBoolean()
  readonly enableHyyyperbridge: boolean;
}
