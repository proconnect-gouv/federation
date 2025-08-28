import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

export class LocalAuthGuard extends AuthGuard('local') {
  /* istanbul ignore next */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = await super.canActivate(context);
    if (can) {
        const request = context.switchToHttp().getRequest();
        await super.logIn(request);
        return true;
    }
    return false;
  }
}
