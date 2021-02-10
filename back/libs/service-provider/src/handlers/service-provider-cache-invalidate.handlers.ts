/* istanbul ignore file */

// Declarative code
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { ServiceProviderOperationTypeChangesEvent } from '../events/service-provider-operation-type-changes.event';
import { ServiceProviderService } from '../service-provider.service';

@EventsHandler(ServiceProviderOperationTypeChangesEvent)
export class ServiceProviderCacheInvalidateHandler
  implements IEventHandler<ServiceProviderOperationTypeChangesEvent> {
  constructor(private readonly providerService: ServiceProviderService) {}

  public async handle(): Promise<void> {
    this.providerService.getList(true);
  }
}
