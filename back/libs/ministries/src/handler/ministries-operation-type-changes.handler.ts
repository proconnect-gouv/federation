/* istanbul ignore file */

// Declarative code
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { MinistriesOperationTypeChangesEvent } from '../events';
import { MinistriesService } from '../ministries.service';

@EventsHandler(MinistriesOperationTypeChangesEvent)
export class MinistriesOperationTypeChangesHandler
  implements IEventHandler<MinistriesOperationTypeChangesEvent> {
  constructor(private readonly minstriesService: MinistriesService) {}

  public async handle(): Promise<void> {
    this.minstriesService.getList(true);
  }
}
