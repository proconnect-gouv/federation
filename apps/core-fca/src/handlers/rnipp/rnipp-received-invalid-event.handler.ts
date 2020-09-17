/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RnippReceivedInvalidEvent } from '@fc/rnipp';
import { TrackingHandler } from '@fc/tracking';

@EventsHandler(RnippReceivedInvalidEvent)
export class RnippReceivedInvalidEventHandler extends TrackingHandler
  implements IEventHandler<RnippReceivedInvalidEvent> {
  async handle(event: RnippReceivedInvalidEvent) {
    this.log(this.EventsMap.FCP_RECEIVED_INVALID_RNIPP, event);
  }
}
