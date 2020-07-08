/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OidcProviderTokenEvent } from '@fc/oidc-provider';
import { TrackingHandler } from '@fc/tracking';
import { EventsMap } from '../../events.map';

@EventsHandler(OidcProviderTokenEvent)
export class OidcProviderTokenEventHandler extends TrackingHandler
  implements IEventHandler<OidcProviderTokenEvent> {
  async handle(event: OidcProviderTokenEvent) {
    this.log(EventsMap.FS_REQUESTED_FCP_TOKEN, event);
  }
}
