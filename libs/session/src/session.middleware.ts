import * as session from 'express-session';
import { NestMiddleware, Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { SessionConfig } from './dto';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  static sessionProxy: Function = session;
  private middleware: Function;

  constructor(private readonly config: ConfigService) {
    const { secret, name, ttl: maxAge } = this.config.get<SessionConfig>(
      'Session',
    );

    this.middleware = SessionMiddleware.sessionProxy({
      secret,
      name,
      resave: true,
      saveUninitialized: false,
      cookie: { maxAge },
    });
  }

  use(req, res, next: () => void): any {
    return this.middleware(req, res, next);
  }
}
