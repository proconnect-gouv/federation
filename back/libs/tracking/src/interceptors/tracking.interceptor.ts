import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { LoggerService as LoggerLegacyService } from '@fc/logger-legacy';

import { Track } from '../decorators/track.decorator';
import { TrackingService } from '../services';

@Injectable()
export class TrackingInterceptor implements NestInterceptor {
  // Dependency injection can require more than 4 parameters

  constructor(
    // Injecting the two following dependencies to make them available for the tracking service
    private readonly loggerLegacy: LoggerLegacyService,
    private readonly tracking: TrackingService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const trackedEvent = Track.get(this.reflector, context);

    if (isEmpty(trackedEvent)) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();

    // track will be called after controller execution
    return next.handle().pipe(
      tap({
        next: this.tracking.track.bind(this, trackedEvent, { req }),
      }),
    );
  }
}
