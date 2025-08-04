import { NestMiddleware, UnauthorizedException } from '@nestjs/common';

export class AuthenticatedMiddleware implements NestMiddleware {
  use(req, res, next: () => void): any {
    if (req.user === undefined) {
      throw new UnauthorizedException();
    }
    return next();
  }
}
