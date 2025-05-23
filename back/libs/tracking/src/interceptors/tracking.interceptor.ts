import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { LoggerService } from '@fc/logger';
import { LoggerService as LoggerLegacyService } from '@fc/logger-legacy';
import { AppTrackingServiceAbstract } from '@fc/tracking/interfaces';
import { APP_TRACKING_SERVICE } from '@fc/tracking/tokens';

import { Track } from '../decorators/track.decorator';
import { TrackingService } from '../services';

@Injectable()
export class TrackingInterceptor implements NestInterceptor {
  // Dependency injection can require more than 4 parameters
  // eslint-disable-next-line max-params
  constructor(
    // Injecting the two following dependencies to make them available for the tracking service
    @Inject(APP_TRACKING_SERVICE)
    private readonly appTrackingService: AppTrackingServiceAbstract,
    private readonly loggerLegacy: LoggerLegacyService,
    private readonly tracking: TrackingService,
    private readonly logger: LoggerService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const eventName = Track.get(this.reflector, context);

    if (isEmpty(eventName)) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();
    const event = this.tracking.TrackedEventsMap[eventName];

    this.logger.debug({
      handler: context.getHandler(),
    });

    // track will be called after controller execution
    return next.handle().pipe(
      tap({
        next: this.tracking.track.bind(this, event, { req }),
      }),
    );
  }
}
