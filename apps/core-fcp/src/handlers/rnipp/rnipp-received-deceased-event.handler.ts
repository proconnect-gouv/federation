/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RnippReceivedDeceasedEvent } from '@fc/rnipp';
import { EventsMap } from '../../events.map';
import { CoreFcpLoggerService } from '../../services';

@EventsHandler(RnippReceivedDeceasedEvent)
export class RnippReceivedDeceasedEventHandler
  implements IEventHandler<RnippReceivedDeceasedEvent> {
  constructor(private readonly coreFcpLogger: CoreFcpLoggerService) {}

  async handle(event: RnippReceivedDeceasedEvent) {
    const { interactionId, ip } = event.properties;

    this.coreFcpLogger.logEvent(
      EventsMap.FCP_RECEIVED_DECEASED_RNIPP,
      ip,
      interactionId,
    );
  }
}
