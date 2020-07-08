/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RnippRequestedEvent } from '@fc/rnipp';
import { TrackingHandler } from '@fc/tracking';
import { EventsMap } from '../../events.map';

@EventsHandler(RnippRequestedEvent)
export class RnippRequestedEventHandler extends TrackingHandler
  implements IEventHandler<RnippRequestedEvent> {
  async handle(event: RnippRequestedEvent) {
    this.log(EventsMap.FCP_REQUESTED_RNIPP, event);
  }
}
