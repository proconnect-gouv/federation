import { Observable } from 'rxjs';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { SessionService } from './session.service';
import { SessionConfig } from './dto';
import {
  SessionNoSessionCookieException,
  SessionNoInteractionCookieException,
} from './exceptions';

/**
 * @TODO (low priority / refatco) refactor this
 * The fact that we rely on data configured in other modules
 * indicates that this interceptor should probably live in a more
 * specific module (core-fcp?) rather than in a generic session module
 */
const FRONT_ROUTES = [
  '/interaction/:uid',
  '/api/v2/redirect-to-idp',
  '/api/v2/oidc-callback/:providerUid',
  '/interaction/:uid/verify',
  '/interaction/:uid/consent',
  '/interaction/:uid/logout',
  '/interaction/:uid/login',
];

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  constructor(
    private readonly config: ConfigService,
    private readonly crypto: CryptographyService,
    private readonly session: SessionService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const res = context.switchToHttp().getResponse();
    const req = context.switchToHttp().getRequest();
    await this.handleSession(req, res);

    return next.handle();
  }

  private async handleSession(req, res) {
    const route = req.route.path;
    const { sessionCookieName, interactionCookieName } = this.config.get<
      SessionConfig
    >('Session');

    // Should just refresh cookies for expiration
    if (FRONT_ROUTES.includes(route)) {
      if (!(sessionCookieName in req.signedCookies)) {
        throw new SessionNoSessionCookieException();
      }

      if (!(interactionCookieName in req.signedCookies)) {
        throw new SessionNoInteractionCookieException();
      }

      const interactionId = req.signedCookies[interactionCookieName];
      const sessionId = req.signedCookies[sessionCookieName];

      await this.session.verify(interactionId, sessionId);

      req['interactionId'] = interactionId;

      this.session.setCookie(res, sessionCookieName, sessionId);
      this.session.setCookie(res, interactionCookieName, interactionId);
    }
  }
}
