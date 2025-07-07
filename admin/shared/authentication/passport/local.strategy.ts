import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { IAuthenticationService } from '../authentication.service';
import { User } from '../../user/user.sql.entity';
import { Password } from '@fc/shared/user/password.sql.entity';
import { UserService } from '../../user/user.service';
import { IAuthenticationTrack } from '../authentication-track.interface';
import {
  AuthenticationActions,
  AuthenticationStates,
} from '../authentication-actions.enum';
import { LoggerService } from '@fc/shared/logger/logger.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('IAuthenticationService')
    private readonly authenticationService: IAuthenticationService,
    private readonly logger: LoggerService,
    private readonly userService: UserService,
  ) {
    super({
      passReqToCallback: true,
    });
  }

  private track(log: IAuthenticationTrack) {
    this.logger.businessEvent(log);
  }

  async validate(
    req,
    usernameInput: string,
    passwordInput: string,
  ): Promise<User> {
    const { params = {} } = req;
    const { token } = params;

    const validUser = await this.authenticationService.validateCredentials(
      usernameInput,
      passwordInput,
      token,
    );

    if (validUser) {
      await this.authenticationService.deleteUserAuthenticationFailures(
        validUser.username,
      );

      return validUser;
    }

    const authenticationFailureReason: AuthenticationStates = await this.authenticationService.getAuthenticationFailureReason(
      usernameInput,
      passwordInput,
      token,
    );

    let messageToDisplay = 'Connexion impossible';

    switch (authenticationFailureReason) {
      case AuthenticationStates.DENIED_MAX_AUTHENTICATION_ATTEMPTS_REACHED:
        await this.blockUser(usernameInput);
        messageToDisplay =
          "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur";
        break;
      case AuthenticationStates.DENIED_BLOCKED_USER:
        messageToDisplay =
          "Vous avez commis trop d'erreurs. Votre compte est bloqué. Veuillez demander un nouveau compte à un administrateur";
        break;
    }

    await this.authenticationService.saveUserAuthenticationFailure(
      usernameInput,
      token,
    );

    this.sendBackFailureReason(
      authenticationFailureReason,
      usernameInput,
      req,
      messageToDisplay,
      !!token,
    );

    return null;
  }

  private sendBackFailureReason(
    authenticationFailureReason: AuthenticationStates,
    usernameInput: string,
    req,
    message: string,
    isNewUser: boolean,
  ) {
    this.track({
      action: isNewUser
        ? AuthenticationActions.TOKEN_SIGNUP
        : AuthenticationActions.SIGNIN,
      state: authenticationFailureReason,
      user: usernameInput,
    });
    req.flash('error', message);
  }

  private async blockUser(usernameInput: string): Promise<User> {
    const blockedUser = await this.userService.blockUser(usernameInput);
    return blockedUser;
  }
}
