import { NestMiddleware, Inject } from '@nestjs/common';
import { AuthenticationDto } from '@fc/shared/authentication/dto/authentication.dto';
import { AuthenticationService } from '@fc/shared/authentication/authentication.service';
import { UserService } from '@fc/shared/user/user.service';
import { LoggerService } from '@fc/shared/logger/logger.service';
import {
  AuthenticationActions,
  AuthenticationStates,
} from '@fc/shared/authentication/authentication-actions.enum';

export class TotpMiddleware implements NestMiddleware {
  public constructor(
    @Inject('otplib') private readonly otplibService,
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  async use(req, res, next: () => void): Promise<void> {
    if (req.user) {
      this.totpInForm(req, next);
    } else {
      await this.totpInLogging(req, res, next);
    }
  }

  private totpInForm(req, next) {
    if (
      !this.otplibService.authenticator.check(req.body._totp, req.user.secret)
    ) {
      req.totp = 'invalid';
    } else {
      req.totp = 'valid';
    }
    return next();
  }

  private async totpInLogging(req, res, next) {
    const { username, _totp }: AuthenticationDto = req.body;

    req.userSecret = await this.authenticationService.getUserSecret(username);

    if (!req.userSecret) {
      this.logger.businessEvent({
        action: AuthenticationActions.TOTP,
        state: AuthenticationStates.DENIED_USER_NOT_FOUND,
        user: username,
      });

      req.flash('globalError', 'Connexion impossible.');
      return res.redirect('/login');
    }

    if (!this.otplibService.authenticator.check(_totp, req.userSecret)) {
      const message = await this.handleUserTotpFailure(username);

      this.logger.businessEvent({
        action: AuthenticationActions.TOTP,
        state: AuthenticationStates.DENIED_TOTP_INVALID,
        user: username,
      });

      req.flash('globalError', message);
      return res.redirect('/login');
    }

    return next();
  }

  private async handleUserTotpFailure(username: string): Promise<string> {
    this.authenticationService.saveUserAuthenticationFailure(username, null);

    let message = 'Connexion impossible.';
    const maxAuthenticationAttemptLimitReached = await this.authenticationService.isMaxAuthenticationAttemptLimitReached(
      username,
    );

    if (maxAuthenticationAttemptLimitReached) {
      await this.userService.blockUser(username);
      message =
        "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur";
    }

    return message;
  }
}
