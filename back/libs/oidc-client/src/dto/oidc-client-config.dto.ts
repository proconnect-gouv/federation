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
        (eachPrefix) => `${eachPrefix}$property must be an https URL`,
      ),
      validate: (value, { object }) =>
        isURL(value, {
          protocols: ["https"],
          require_protocol: true,
          require_tld: !(object as OidcClientConfig).isLocalhostAllowed,
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
  readonly isLocalhostAllowed?: boolean;

  @IsCallbackUrl()
  readonly redirectUri: string;

  @IsCallbackUrl()
  readonly postLogoutRedirectUri: string;

  @IsBoolean()
  readonly enableHyyyperbridge: boolean;
}
