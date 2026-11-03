import { IsString } from "class-validator";

import { CLIENT_METADATA } from "#libs/identity-provider-adapter-mongo";
import { JsonValue } from "oauth4webapi";
import { ClientMetadata } from "openid-client";

export class FederationClientMetadata implements Pick<
  ClientMetadata,
  (typeof CLIENT_METADATA)[number]
> {
  @IsString()
  client_id: string;

  @IsString()
  client_secret: string;

  @IsString()
  id_token_signed_response_alg: string;

  @IsString()
  id_token_encrypted_response_alg: string;

  @IsString()
  id_token_encrypted_response_enc: string;

  @IsString()
  userinfo_encrypted_response_alg: string;

  @IsString()
  userinfo_encrypted_response_enc: string;

  @IsString()
  userinfo_signed_response_alg: string;

  [metadata: string]: JsonValue | undefined;
}
