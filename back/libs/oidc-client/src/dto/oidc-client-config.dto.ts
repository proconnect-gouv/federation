import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  Matches,
} from "class-validator";

import { JSONWebKeySet } from "jose";

const URL_REGEX = /^https?:\/\/[^/].+$/;

export class OidcClientConfig {
  @IsNumber()
  readonly timeout: number;

  @IsOptional()
  @IsObject()
  readonly jwks?: JSONWebKeySet;

  @Matches(URL_REGEX)
  readonly redirectUri: string;

  @Matches(URL_REGEX)
  readonly postLogoutRedirectUri: string;

  @IsBoolean()
  readonly enableHyyyperbridge: boolean;
}
