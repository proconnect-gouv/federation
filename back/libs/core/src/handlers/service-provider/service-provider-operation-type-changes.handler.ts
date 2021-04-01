/* istanbul ignore file */

// Declarative code
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { ServiceProviderOperationTypeChangesEvent } from '@fc/service-provider-adapter-mongo';
import { OidcProviderService } from '@fc/oidc-provider';

@EventsHandler(ServiceProviderOperationTypeChangesEvent)
export class ServiceProviderOperationTypeChangesHandler
  implements IEventHandler<ServiceProviderOperationTypeChangesEvent> {
  constructor(private readonly oidcProvider: OidcProviderService) {}

  public async handle(): Promise<void> {
    this.oidcProvider.reloadConfiguration();
  }
}
