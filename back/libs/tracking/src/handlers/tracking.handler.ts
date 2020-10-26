import { Injectable } from '@nestjs/common';
import { TrackingService } from '../tracking.service';
import { IEvent, IEventContext, IEventMap } from '../interfaces';

@Injectable()
export abstract class TrackingHandler {
  constructor(private readonly tracking: TrackingService) {}

  protected get EventsMap(): IEventMap {
    return this.tracking.EventsMap;
  }

  protected async log(event: IEvent, context: IEventContext) {
    this.tracking.log(event, context);
  }
}
