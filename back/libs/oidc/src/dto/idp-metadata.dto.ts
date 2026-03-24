import { IDP_METADATA } from "@fc/identity-provider-adapter-mongo";
import { IsString } from "class-validator";
import { JsonValue } from "oauth4webapi";
import { ServerMetadata } from "openid-client";

export class FederationServerMetadata implements Pick<
  ServerMetadata,
  (typeof IDP_METADATA)[number]
> {
  @IsString()
  issuer: string;

  @IsString()
  token_endpoint: string;

  @IsString()
  authorization_endpoint: string;

  @IsString()
  jwks_uri: string;

  @IsString()
  userinfo_endpoint: string;

  @IsString()
  end_session_endpoint: string;

  [metadata: string]: JsonValue | undefined;
}
