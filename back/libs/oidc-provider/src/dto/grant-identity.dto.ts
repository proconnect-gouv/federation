import type { UserSession } from "#src";
import { IsNotEmpty, IsObject, IsString } from "class-validator";

/**
 * What a login hands over to the service provider, stored per grant.
 * @see OidcProviderGrantIdentityService
 */
export class GrantIdentity {
  @IsObject()
  readonly spIdentity: UserSession["spIdentity"];

  // Only used to load the session for the logs of /token and /userinfo.
  @IsString()
  @IsNotEmpty()
  readonly sessionId: string;
}
