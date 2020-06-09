/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RnippRequestEvent } from '@fc/rnipp';
import { EventsMap } from '../../events.map';
import { CoreFcpLoggerService } from '../../core-fcp-logger.service';

@EventsHandler(RnippRequestEvent)
export class RnippRequestEventHandler
  implements IEventHandler<RnippRequestEvent> {
  constructor(private readonly coreFcpLogger: CoreFcpLoggerService) {}

  async handle(event: RnippRequestEvent) {
    const { interactionId, ip } = event.properties;

    this.coreFcpLogger.logEvent(
      EventsMap.FCP_REQUESTED_RNIPP,
      ip,
      interactionId,
    );
  }
}
