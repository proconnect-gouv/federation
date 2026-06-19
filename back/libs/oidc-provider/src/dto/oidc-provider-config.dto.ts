import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";
import { type Configuration } from "oidc-provider";
import { OidcProviderPrompt } from "../enums";

export class OidcProviderConfig {
  @IsString()
  readonly prefix: string;

  @IsString()
  readonly issuer: string;

  @IsObject()
  readonly routes: Configuration["routes"];

  @IsObject()
  readonly cookies: Configuration["cookies"];

  @IsArray()
  readonly supportedAcrValues: Configuration["acrValues"];

  @IsObject()
  readonly jwks: Configuration["jwks"];

  @IsNumber()
  readonly timeout: ReturnType<Configuration["httpOptions"]>["timeout"];

  @IsArray()
  @IsEnum(OidcProviderPrompt, { each: true })
  readonly forcedPrompt: OidcProviderPrompt[];

  @IsArray()
  @IsEnum(OidcProviderPrompt, { each: true })
  readonly allowedPrompt: OidcProviderPrompt[];

  @IsBoolean()
  @IsOptional()
  readonly isLocalhostAllowed?: boolean;

  @IsUrl()
  readonly errorUriBase?: string;
}
