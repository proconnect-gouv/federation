/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OidcProviderAuthorizationEvent } from '@fc/oidc-provider';
import { TrackingHandler } from '@fc/tracking';
import { EventsMap } from '../../events.map';

@EventsHandler(OidcProviderAuthorizationEvent)
export class OidcProviderAuthorizationEventHandler extends TrackingHandler
  implements IEventHandler<OidcProviderAuthorizationEvent> {
  async handle(event: OidcProviderAuthorizationEvent) {
    this.log(EventsMap.FCP_AUTHORIZE_INITIATED, event);
  }
}
