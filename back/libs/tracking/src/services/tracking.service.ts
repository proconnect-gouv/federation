import { Global, Injectable, Scope } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { LoggerService as LoggerLegacyService } from '@fc/logger-legacy';

import { TrackingConfig } from '../dto';
import {
  TrackedEventContextInterface,
  TrackedEventInterface,
  TrackedEventMapType,
} from '../interfaces';
import { CoreTrackingService } from './core-tracking.service';

@Global()
@Injectable({ scope: Scope.DEFAULT })
export class TrackingService {
  public TrackedEventsMap: TrackedEventMapType = {};
  constructor(
    private readonly appTrackingService: CoreTrackingService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly loggerLegacy: LoggerLegacyService,
  ) {}

  onModuleInit() {
    const { eventsMap } = this.config.get<TrackingConfig>('Tracking');
    this.TrackedEventsMap = eventsMap;
  }

  // eslint-disable-next-line require-await
  async track(
    trackedEvent: TrackedEventInterface,
    context: TrackedEventContextInterface,
  ): Promise<void> {
    const message = this.appTrackingService.buildLog(trackedEvent, context);

    this.loggerLegacy.businessEvent(message);
  }
}
