import { promisify } from 'util';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = await this.wrappedSuperCanActivate(context);

    if (can) {
      const request = context.switchToHttp().getRequest();

      const sessionDestroy = promisify(
        request.session.destroy.bind(request.session),
      );
      const sessionRegenerate = promisify(
        request.session.regenerate.bind(request.session),
      );
      await sessionDestroy();
      await sessionRegenerate();

      super.logIn(request);
      return true;
    }

    return false;
  }

  /**
   * Wrap call to super.canActivate to allow unit test mocking
   *
   * Simple wrapper
   */
  /* istanbul ignore next line */
  private async wrappedSuperCanActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
