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

import { Track } from '../decorators/track.decorator';
import { TrackingService } from '../services';

@Injectable()
export class TrackingInterceptor implements NestInterceptor {
  // Dependency injection can require more than 4 parameters

  constructor(
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
    /* istanbul ignore next */
    return next.handle().pipe(
      tap({
        next: () => this.tracking.track(trackedEvent, { req }),
      }),
    );
  }
}
