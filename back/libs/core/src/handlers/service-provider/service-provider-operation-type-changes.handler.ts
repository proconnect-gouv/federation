/* istanbul ignore file */

// Declarative code
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { ServiceProviderOperationTypeChangesEvent } from '@fc/service-provider';
import { OidcClientService } from '@fc/oidc-client';

@EventsHandler(ServiceProviderOperationTypeChangesEvent)
export class ServiceProviderOperationTypeChangesHandler
  implements IEventHandler<ServiceProviderOperationTypeChangesEvent> {
  constructor(private readonly oidcClient: OidcClientService) {}

  public async handle(): Promise<void> {
    this.oidcClient.reloadConfiguration();
  }
}
