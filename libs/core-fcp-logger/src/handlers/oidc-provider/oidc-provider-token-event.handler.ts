/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OidcProviderTokenEvent } from '@fc/oidc-provider';
import { EventsMap } from '../../events.map';
import { CoreFcpLoggerService } from '../../core-fcp-logger.service';

@EventsHandler(OidcProviderTokenEvent)
export class OidcProviderTokenEventHandler
  implements IEventHandler<OidcProviderTokenEvent> {
  constructor(private readonly coreFcpLogger: CoreFcpLoggerService) {}

  async handle(event: OidcProviderTokenEvent) {
    const { interactionId, ip } = event.properties;

    this.coreFcpLogger.logEvent(
      EventsMap.FS_REQUESTED_FCP_TOKEN,
      ip,
      interactionId,
    );
  }
}
