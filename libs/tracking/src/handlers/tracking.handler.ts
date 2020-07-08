import { Injectable } from '@nestjs/common';
import { TrackingService } from '../tracking.service';
import { IEvent, IEventContext } from '../interfaces';

@Injectable()
export abstract class TrackingHandler {
  constructor(private readonly tracking: TrackingService) {}

  protected async log(event: IEvent, context: IEventContext) {
    this.tracking.log(event, context);
  }
}
