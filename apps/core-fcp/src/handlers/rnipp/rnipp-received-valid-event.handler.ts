/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RnippReceivedValidEvent } from '@fc/rnipp';
import { EventsMap } from '../../events.map';
import { CoreFcpLoggerService } from '../../services';

@EventsHandler(RnippReceivedValidEvent)
export class RnippReceivedValidEventHandler
  implements IEventHandler<RnippReceivedValidEvent> {
  constructor(private readonly coreFcpLogger: CoreFcpLoggerService) {}

  async handle(event: RnippReceivedValidEvent) {
    const { interactionId, ip } = event.properties;

    this.coreFcpLogger.logEvent(
      EventsMap.FCP_RECEIVED_VALID_RNIPP,
      ip,
      interactionId,
    );
  }
}
