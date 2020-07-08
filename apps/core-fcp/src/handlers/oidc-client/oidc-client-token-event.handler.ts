/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OidcClientTokenEvent } from '@fc/oidc-client';
import { TrackingHandler } from '@fc/tracking';
import { EventsMap } from '../../events.map';

@EventsHandler(OidcClientTokenEvent)
export class OidcClientTokenEventHandler extends TrackingHandler
  implements IEventHandler<OidcClientTokenEvent> {
  async handle(event: OidcClientTokenEvent) {
    this.log(EventsMap.FCP_REQUESTED_IDP_TOKEN, event);
  }
}
