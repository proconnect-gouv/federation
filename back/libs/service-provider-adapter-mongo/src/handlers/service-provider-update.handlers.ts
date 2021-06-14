/* istanbul ignore file */

// Declarative code
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { ServiceProviderUpdateEvent } from '../events/service-provider-update.event';
import { ServiceProviderAdapterMongoService } from '../service-provider-adapter-mongo.service';

@EventsHandler(ServiceProviderUpdateEvent)
export class ServiceProviderUpdateHandler
  implements IEventHandler<ServiceProviderUpdateEvent>
{
  constructor(
    private readonly providerService: ServiceProviderAdapterMongoService,
  ) {}

  public async handle(): Promise<void> {
    this.providerService.getList(true);
  }
}
