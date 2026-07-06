import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsUrl,
} from "class-validator";

// @ts-expect-error
import { JSONWebKeySet } from "jose-v2";

export class OidcClientConfig {
  @IsNumber()
  readonly timeout!: number;

  @IsOptional()
  @IsObject()
  readonly jwks?: JSONWebKeySet;

  @IsUrl({
    protocols: ["https"],
    require_protocol: true,
  })
  readonly redirectUri!: string;

  @IsUrl({
    protocols: ["https"],
    require_protocol: true,
  })
  readonly postLogoutRedirectUri!: string;

  @IsBoolean()
  readonly enableHyyyperbridge!: boolean;
}
