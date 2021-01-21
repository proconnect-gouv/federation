/* istanbul ignore file */

// Declarative code
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { IdentityProviderOperationTypeChangesEvent } from '../events';
import { IdentityProviderService } from '../identity-provider.service';

@EventsHandler(IdentityProviderOperationTypeChangesEvent)
export class IdentityProviderOperationTypeChangesHandler
  implements IEventHandler<IdentityProviderOperationTypeChangesEvent> {
  constructor(private readonly identityProvider: IdentityProviderService) {}

  public async handle(): Promise<void> {
    this.identityProvider.getList(true);
  }
}
