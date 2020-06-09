/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RnippReceivedInvalidEvent } from '@fc/rnipp';
import { EventsMap } from '../../events.map';
import { CoreFcpLoggerService } from '../../core-fcp-logger.service';

@EventsHandler(RnippReceivedInvalidEvent)
export class RnippReceivedInvalidEventHandler
  implements IEventHandler<RnippReceivedInvalidEvent> {
  constructor(private readonly coreFcpLogger: CoreFcpLoggerService) {}

  async handle(event: RnippReceivedInvalidEvent) {
    const { interactionId, ip } = event.properties;

    this.coreFcpLogger.logEvent(
      EventsMap.FCP_RECEIVED_INVALID_RNIPP,
      ip,
      interactionId,
    );
  }
}
