/* istanbul ignore file */

// Declarative code
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { IdentityProviderOperationTypeChangesEvent } from '@fc/identity-provider';
import { OidcProviderService } from '@fc/oidc-provider';

@EventsHandler(IdentityProviderOperationTypeChangesEvent)
export class IdentityProviderOperationTypeChangesHandler
  implements IEventHandler<IdentityProviderOperationTypeChangesEvent> {
  constructor(private readonly oidcProvider: OidcProviderService) {}

  public async handle(): Promise<void> {
    this.oidcProvider.reloadConfiguration();
  }
}
