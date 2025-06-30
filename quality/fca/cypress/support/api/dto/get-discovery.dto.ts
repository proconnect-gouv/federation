import { IsArray, IsBoolean, IsString, MinLength } from 'class-validator';

/* eslint-disable @typescript-eslint/naming-convention */
export class GetDiscoveryDto {
  @IsString({ each: true })
  @IsArray()
  readonly acr_values_supported: string[];

  @IsString()
  @MinLength(1)
  readonly authorization_endpoint: string;

  @IsBoolean()
  readonly claims_parameter_supported: boolean;

  @IsString({ each: true })
  @IsArray()
  readonly claims_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly code_challenge_methods_supported: string[];

  @IsString()
  @MinLength(1)
  readonly end_session_endpoint: string;

  @IsString({ each: true })
  @IsArray()
  readonly grant_types_supported: string[];

  @IsString({ each: true })
  @IsArray()
  // oidc defined variable name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly id_token_signing_alg_values_supported: string[];

  @IsString()
  @MinLength(1)
  readonly issuer: string;

  @IsString()
  @MinLength(1)
  readonly jwks_uri: string;

  @IsBoolean()
  readonly authorization_response_iss_parameter_supported: boolean;

  @IsString({ each: true })
  @IsArray()
  readonly response_modes_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly response_types_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly scopes_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly subject_types_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly token_endpoint_auth_methods_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly token_endpoint_auth_signing_alg_values_supported: string[];

  @IsString()
  @MinLength(1)
  readonly token_endpoint: string;

  @IsString({ each: true })
  @IsArray()
  readonly request_object_signing_alg_values_supported: string[];

  @IsBoolean()
  readonly request_parameter_supported: boolean;

  @IsBoolean()
  readonly request_uri_parameter_supported: boolean;

  @IsBoolean()
  readonly require_request_uri_registration: boolean;

  @IsString()
  @MinLength(1)
  readonly userinfo_endpoint: string;

  @IsString({ each: true })
  @IsArray()
  readonly userinfo_signing_alg_values_supported: string[];

  @IsString()
  @MinLength(1)
  readonly revocation_endpoint: string;

  @IsString({ each: true })
  @IsArray()
  readonly revocation_endpoint_auth_methods_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly revocation_endpoint_auth_signing_alg_values_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly claim_types_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly id_token_encryption_alg_values_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly id_token_encryption_enc_values_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly userinfo_encryption_alg_values_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly userinfo_encryption_enc_values_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly request_object_encryption_alg_values_supported: string[];

  @IsString({ each: true })
  @IsArray()
  readonly request_object_encryption_enc_values_supported: string[];
}
/* eslint-enable @typescript-eslint/naming-convention */
