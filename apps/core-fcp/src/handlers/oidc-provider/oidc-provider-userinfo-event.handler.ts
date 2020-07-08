/* istanbul ignore file */

// Declarative code
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OidcProviderUserinfoEvent } from '@fc/oidc-provider';
import { TrackingHandler } from '@fc/tracking';
import { EventsMap } from '../../events.map';

@EventsHandler(OidcProviderUserinfoEvent)
export class OidcProviderUserinfoEventHandler extends TrackingHandler
  implements IEventHandler<OidcProviderUserinfoEvent> {
  async handle(event: OidcProviderUserinfoEvent) {
    this.log(EventsMap.FS_REQUESTED_FCP_USERINFO, event);
  }
}
