import { Observable } from 'rxjs';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { SessionGenericConfig } from '../dto';
import { ExcludedRoutes } from '../types';
import { SessionGenericService } from '../services';
import { ISessionGenericRequest } from '../interfaces';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  private excludedRoutes: ExcludedRoutes;

  constructor(
    private readonly config: ConfigService,
    private readonly sessionGenericService: SessionGenericService,
  ) {}

  onModuleInit() {
    const { excludedRoutes } =
      this.config.get<SessionGenericConfig>('SessionGeneric');

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

  private async handleSession(req: ISessionGenericRequest, res) {
    const cookieSessionId =
      this.sessionGenericService.getSessionIdFromCookie(req);

    if (!cookieSessionId) {
      this.sessionGenericService.init(req, res);
    } else {
      await this.sessionGenericService.refresh(req, res);
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
