import { Observable } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { ConfigService } from '@fc/config';

import { SessionConfig } from '../dto';
import { ISessionRequest } from '../interfaces';
import { SessionService } from '../services';
import { ExcludedRoutes } from '../types';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  private excludedRoutes: ExcludedRoutes;

  constructor(
    private readonly config: ConfigService,
    private readonly sessionService: SessionService,
  ) {}

  onModuleInit() {
    const { excludedRoutes } = this.config.get<SessionConfig>('Session');

    this.excludedRoutes = excludedRoutes;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();

    if (this.shouldHandleSession(req.route.path)) {
      const res = context.switchToHttp().getResponse();
      await this.handleSession(req, res);
    }

    return next.handle();
  }

  private async handleSession(req: ISessionRequest, res) {
    const cookieSessionId = this.sessionService.getSessionIdFromCookie(req);

    if (!cookieSessionId) {
      this.sessionService.init(req, res);
    } else {
      await this.sessionService.refresh(req, res);
    }
  }

  private shouldHandleSession(route: string): boolean {
    const shouldExclude = this.excludedRoutes.find((excludedRoute) => {
      if (excludedRoute instanceof RegExp) {
        return excludedRoute.test(route);
      }

      return excludedRoute === route;
    });

    return !shouldExclude;
  }
}
