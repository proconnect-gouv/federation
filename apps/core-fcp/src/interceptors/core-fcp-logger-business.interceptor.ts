import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { CoreFcpLoggerService } from '../services';
import { EventsMap } from '../events.map';
import { IEventMap } from '../interfaces';

@Injectable()
export class CoreFcpLoggerBusinessInterceptor implements NestInterceptor {
  constructor(private readonly coreFcpLogger: CoreFcpLoggerService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(tap(this.logEvent.bind(this, req)));
  }

  private logEvent(req) {
    const { ip } = req;
    const event = this.getEvent(req, EventsMap);

    if (event && req.fc) {
      const { interactionId } = req.fc;
      this.coreFcpLogger.logEvent(event, ip, interactionId);
    }
  }

  private getEvent(req, events: IEventMap) {
    const {
      route: { path },
    } = req;
    return Object.entries(events)
      .map(([, event]) => event)
      .filter(({ intercept }) => intercept)
      .find((event) => event.route === path);
  }
}
