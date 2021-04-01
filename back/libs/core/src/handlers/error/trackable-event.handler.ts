import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TrackingHandler } from '@fc/tracking';
import { TrackableEvent } from '@fc/exceptions';

@EventsHandler(TrackableEvent)
export class TrackableEventHandler
  extends TrackingHandler
  implements IEventHandler<TrackableEvent> {
  async handle(event: TrackableEvent) {
    const { context } = event;
    const eventFromMap = this.getEventFromMap(context);

    if (eventFromMap) {
      this.log(eventFromMap, context);
    }
  }

  private getEventFromMap(context = null) {
    const exceptionClass = context?.exception?.constructor;
    if (!exceptionClass) {
      return null;
    }

    return Object.values(this.EventsMap)
      .filter(({ exceptions }) => exceptions)
      .find(({ exceptions }) => exceptions.includes(exceptionClass));
  }
}
