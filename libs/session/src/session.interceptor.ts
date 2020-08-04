import { Observable } from 'rxjs';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { AppConfig } from '@fc/app';
import { SessionService } from './session.service';
import { SessionConfig } from './dto';
import { IFcReq } from './interfaces';
import {
  SessionNoSessionCookieException,
  SessionNoInteractionCookieException,
} from './exceptions';

/**
 * @TODO #149 (low priority / refatco) refactor this
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/149
 * The fact that we rely on data configured in other modules
 * indicates that this interceptor should probably live in a more
 * specific module (core-fcp?) rather than in a generic session module
 */
function getFrontRoutes(urlPrefix: string): string[] {
  return [
    `${urlPrefix}/redirect-to-idp`,
    `${urlPrefix}/oidc-callback/:providerUid`,
    `${urlPrefix}/interaction/:uid`,
    `${urlPrefix}/interaction/:uid/verify`,
    `${urlPrefix}/interaction/:uid/consent`,
    `${urlPrefix}/interaction/:uid/logout`,
    `${urlPrefix}/interaction/:uid/login`,
  ];
}

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  private readonly FrontRoutes;

  constructor(
    private readonly config: ConfigService,
    /**
     * @todo Remove if not used.
     * Don't forget to remove in tests: "expect(cryptographyMock.genSessionId).toHaveBeenCalledTimes(0)"
     */
    private readonly crypto: CryptographyService,
    private readonly session: SessionService,
  ) {
    this.FrontRoutes = getFrontRoutes(
      this.config.get<AppConfig>('App').urlPrefix,
    );
  }

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
    if (this.FrontRoutes.includes(route)) {
      if (!(sessionCookieName in req.signedCookies)) {
        throw new SessionNoSessionCookieException();
      }

      if (!(interactionCookieName in req.signedCookies)) {
        throw new SessionNoInteractionCookieException();
      }

      const interactionId = req.signedCookies[interactionCookieName];
      const sessionId = req.signedCookies[sessionCookieName];

      await this.session.verify(interactionId, sessionId);

      // Make interactionId available in `req`
      if (!req.fc) {
        req.fc = {} as IFcReq;
      }
      req.fc.interactionId = interactionId;

      // Refresh session on backend
      await this.session.refresh(interactionId);

      // Refresh session on client
      this.session.setCookie(res, sessionCookieName, sessionId);
      this.session.setCookie(res, interactionCookieName, interactionId);
    }
  }
}
