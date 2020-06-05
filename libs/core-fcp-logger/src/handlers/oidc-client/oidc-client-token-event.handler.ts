import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OidcClientTokenEvent } from '@fc/oidc-client';
import { CoreFcpLoggerService } from '../../core-fcp-logger.service';
import { EventsMap } from '../../events.map';

@EventsHandler(OidcClientTokenEvent)
export class OidcClientTokenEventHandler
  implements IEventHandler<OidcClientTokenEvent> {
  constructor(private readonly coreFcpLogger: CoreFcpLoggerService) {}

  async handle(event: OidcClientTokenEvent) {
    const { interactionId, ip } = event;

    this.coreFcpLogger.logEvent(
      EventsMap.FCP_REQUESTED_IDP_TOKEN,
      ip,
      interactionId,
    );
  }
}
