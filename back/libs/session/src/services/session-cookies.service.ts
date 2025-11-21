import { Request, Response } from 'express';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';

import { SessionConfig } from '../dto';
import { SessionBadCookieException } from '../exceptions';

@Injectable()
export class SessionCookiesService {
  constructor(private readonly config: ConfigService) {}

  get(req: Request): string | undefined {
    const { sessionCookieName } = this.config.get<SessionConfig>('Session');

    const sessionId = req.signedCookies[sessionCookieName];

    if (sessionId && typeof sessionId !== 'string') {
      throw new SessionBadCookieException();
    }

    return sessionId;
  }

  set(res: Response, sessionId: string): void {
    const { cookieOptions, sessionCookieName } =
      this.config.get<SessionConfig>('Session');

    res.cookie(sessionCookieName, sessionId, cookieOptions);
  }

  remove(res: Response) {
    const { sessionCookieName } = this.config.get<SessionConfig>('Session');

    // This function is only called through userSession.destroy()
    // The userSession service needs the session middleware to be called to work.
    // The session middleware systematically adds a Set-Cookie header to the response if no cookie is already set.
    // We need to remove the previously added header for the clearCookie instruction to work.
    res.removeHeader('Set-Cookie');
    res.clearCookie(sessionCookieName);
  }
}
