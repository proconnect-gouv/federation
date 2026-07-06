import { IsArray, IsString } from "class-validator";

import { CLIENT_METADATA } from "@fc/identity-provider-adapter-mongo";
import { JsonValue } from "oauth4webapi";
import { ClientMetadata } from "openid-client";

export class FederationClientMetadata implements Pick<
  ClientMetadata,
  (typeof CLIENT_METADATA)[number]
> {
  @IsString()
  client_id!: string;

  @IsString()
  client_secret!: string;

  @IsArray()
  response_types!: string[];

  @IsString()
  id_token_signed_response_alg!: string;

  @IsString()
  token_endpoint_auth_method!: string;

  @IsString()
  revocation_endpoint_auth_method!: string;

  @IsString()
  id_token_encrypted_response_alg!: string;

  @IsString()
  id_token_encrypted_response_enc!: string;

  @IsString()
  userinfo_encrypted_response_alg!: string;

  @IsString()
  userinfo_encrypted_response_enc!: string;

  @IsString()
  userinfo_signed_response_alg!: string;

  [metadata: string]: JsonValue | undefined;
}
