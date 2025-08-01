import { NestMiddleware, Injectable } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

@Injectable()
export class AppContextMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req, res, next: () => void): any {
    const appConfig = this.configService.get('app');
    res.locals.APP_ROOT = appConfig.app_root || '';
    return next();
  }
}
