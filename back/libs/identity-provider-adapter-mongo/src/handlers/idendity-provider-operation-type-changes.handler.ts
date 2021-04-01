/* istanbul ignore file */

// Declarative code
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { IdentityProviderOperationTypeChangesEvent } from '../events';
import { IdentityProviderAdapterMongoService } from '../identity-provider-adapter-mongo.service';

@EventsHandler(IdentityProviderOperationTypeChangesEvent)
export class IdentityProviderOperationTypeChangesHandler
  implements IEventHandler<IdentityProviderOperationTypeChangesEvent> {
  constructor(
    private readonly identityProvider: IdentityProviderAdapterMongoService,
  ) {}

  public async handle(): Promise<void> {
    this.identityProvider.getList(true);
  }
}
