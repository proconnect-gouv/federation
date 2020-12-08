import { Observable } from 'rxjs';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { SessionGenericConfig } from '../dto';
import { ExcludedRoutes } from '../types';
import { SessionGenericService } from '../session-generic.service';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  private excludedRoutes: ExcludedRoutes;
  private sessionCookieName: string;
  private sessionIdLength: number;

  constructor(
    private readonly config: ConfigService,
    private readonly cryptography: CryptographyService,
    private readonly sessionGenericService: SessionGenericService,
  ) {}

  onModuleInit() {
    const {
      sessionCookieName,
      sessionIdLength,
      excludedRoutes,
    } = this.config.get<SessionGenericConfig>('SessionGeneric');

    this.excludedRoutes = excludedRoutes;
    this.sessionCookieName = sessionCookieName;
    this.sessionIdLength = sessionIdLength;
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

  private async handleSession(req, res) {
    if (!(this.sessionCookieName in req.signedCookies)) {
      req.sessionId = this.cryptography.genRandomString(this.sessionIdLength);

      this.setCookie(res, this.sessionCookieName, req.sessionId);
    } else {
      req.sessionId = req.signedCookies[this.sessionCookieName];
    }

    req.sessionService = this.sessionGenericService;
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

  setCookie(res, name, value) {
    const { cookieOptions } = this.config.get<SessionGenericConfig>(
      'SessionGeneric',
    );
    res.cookie(name, value, cookieOptions);
  }
}
