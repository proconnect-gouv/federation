/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OidcProviderAuthorizationEvent } from '@fc/oidc-provider';
import { EventsMap } from '../../events.map';
import { CoreFcpLoggerService } from '../../services';

@EventsHandler(OidcProviderAuthorizationEvent)
export class OidcProviderAuthorizationEventHandler
  implements IEventHandler<OidcProviderAuthorizationEvent> {
  constructor(private readonly coreFcpLogger: CoreFcpLoggerService) {}

  async handle(event: OidcProviderAuthorizationEvent) {
    this.coreFcpLogger.logAuthorize(
      EventsMap.FCP_AUTHORIZE_INITIATED,
      event.properties,
    );
  }
}
