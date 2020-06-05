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
const START_ROUTE = '/api/v2/authorize';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  constructor(
    private readonly config: ConfigService,
    private readonly crypto: CryptographyService,
    private readonly session: SessionService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse();
    const req = context.switchToHttp().getRequest();
    this.handleCookies(req, res);

    return next.handle();
  }

  private handleCookies(req, res) {
    const route = req.route.path;
    const { sessionCookieName, interactionCookieName } = this.config.get<
      SessionConfig
    >('Session');

    /**
     * Should get interactionId from req and create a new session
     * We do not allow a session to be started anywhere, one has to go through START_ROUTE
     */
    if (route === START_ROUTE) {
      // Genrate our own session id for more security
      const fcSessionId = this.crypto.genSessionId();

      this.session.setCookie(res, sessionCookieName, fcSessionId);
      /**
       * Workarround !
       * `oidc-provider` lib does a `.forEach` on `set-cookie` propetry of response object,
       * but express does not always set this property as an array.
       *
       * If only one cookie is to be set ine the response, `set-cookie` will be a string.
       * If several cookies are te be set, `set-cookie`will be an array.
       *
       * So we set a second, meaningless cookie, to be sure an array is returned.
       *
       *
       * @todo fix this by submitting an issue / a PR
       * on oidc-provider repository:
       * @see https://github.com/panva/node-oidc-provider/blob/e1eb211618a2f9f2470d8cad00660805c7dc88a2/lib/shared/session.js#L48
       */
      this.session.setCookie(res, 'spoon', 'there is none');
    }

    // Should just refresh cookies for expiration
    if (FRONT_ROUTES.includes(route)) {
      if (!(sessionCookieName in req.signedCookies)) {
        throw new SessionNoSessionCookieException();
      }

      if (!(interactionCookieName in req.signedCookies)) {
        throw new SessionNoInteractionCookieException();
      }

      req['interactionId'] = req.signedCookies[interactionCookieName];

      this.session.refreshCookie(req, res, sessionCookieName);
      this.session.refreshCookie(req, res, interactionCookieName);
    }
  }
}
