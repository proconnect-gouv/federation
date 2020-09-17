/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RnippReceivedDeceasedEvent } from '@fc/rnipp';
import { TrackingHandler } from '@fc/tracking';

@EventsHandler(RnippReceivedDeceasedEvent)
export class RnippReceivedDeceasedEventHandler extends TrackingHandler
  implements IEventHandler<RnippReceivedDeceasedEvent> {
  async handle(event: RnippReceivedDeceasedEvent) {
    this.log(this.EventsMap.FCP_RECEIVED_DECEASED_RNIPP, event);
  }
}
