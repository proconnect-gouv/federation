/* istanbul ignore file */

// Declarative code
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { IdentityProviderOperationTypeChangesEvent } from '@fc/identity-provider';
import { OidcClientService } from '@fc/oidc-client';

@EventsHandler(IdentityProviderOperationTypeChangesEvent)
export class IdentityProviderOperationTypeChangesHandler
  implements IEventHandler<IdentityProviderOperationTypeChangesEvent> {
  constructor(private readonly oidcClient: OidcClientService) {}

  public async handle(): Promise<void> {
    this.oidcClient.reloadConfiguration();
  }
}
