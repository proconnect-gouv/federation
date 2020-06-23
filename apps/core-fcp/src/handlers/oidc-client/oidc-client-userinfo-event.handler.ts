/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OidcClientUserinfoEvent } from '@fc/oidc-client';
import { CoreFcpLoggerService } from '../../services';
import { EventsMap } from '../../events.map';

@EventsHandler(OidcClientUserinfoEvent)
export class UserinfoEventHandler
  implements IEventHandler<OidcClientUserinfoEvent> {
  constructor(private readonly coreFcpLogger: CoreFcpLoggerService) {}

  async handle(event: OidcClientUserinfoEvent) {
    const { interactionId, ip } = event;

    this.coreFcpLogger.logEvent(
      EventsMap.FCP_REQUESTED_IDP_USERINFO,
      ip,
      interactionId,
    );
  }
}
