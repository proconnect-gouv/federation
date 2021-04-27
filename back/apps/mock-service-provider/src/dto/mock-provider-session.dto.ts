/* istanbul ignore file */

// Declarative code
import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OidcClientSession } from '@fc/oidc-client';

export class MockServiceProviderSession {
  @IsObject()
  @ValidateNested()
  @Type(() => OidcClientSession)
  readonly OidcClient: OidcClientSession;
}
