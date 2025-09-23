import { Global, Injectable, Scope } from '@nestjs/common';

import { LoggerService } from '@fc/logger';
import { LoggerService as LoggerLegacyService } from '@fc/logger-legacy';

import { TrackedEvent } from '../enums';
import { TrackedEventContextInterface } from '../interfaces';
import { CoreTrackingService } from './core-tracking.service';

@Global()
@Injectable({ scope: Scope.DEFAULT })
export class TrackingService {
  constructor(
    private readonly appTrackingService: CoreTrackingService,
    private readonly logger: LoggerService,
    private readonly loggerLegacy: LoggerLegacyService,
  ) {}

  // eslint-disable-next-line require-await
  async track(
    trackedEvent: TrackedEvent,
    context: TrackedEventContextInterface,
  ): Promise<void> {
    const message = this.appTrackingService.buildLog(trackedEvent, context);

    this.loggerLegacy.businessEvent(message);
  }
}
