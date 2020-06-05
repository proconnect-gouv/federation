import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OidcProviderUserinfoEvent } from '@fc/oidc-provider';
import { EventsMap } from '../../events.map';
import { CoreFcpLoggerService } from '../../core-fcp-logger.service';

@EventsHandler(OidcProviderUserinfoEvent)
export class OidcProviderUserinfoEventHandler
  implements IEventHandler<OidcProviderUserinfoEvent> {
  constructor(private readonly coreFcpLogger: CoreFcpLoggerService) {}

  async handle(event: OidcProviderUserinfoEvent) {
    const { interactionId, ip } = event.properties;

    this.coreFcpLogger.logEvent(
      EventsMap.FS_REQUESTED_FCP_USERINFO,
      ip,
      interactionId,
    );
  }
}
