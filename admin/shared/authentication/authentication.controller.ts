import { promisify } from 'util';
import {
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guard/local.guard';
import { IAuthenticationTrack } from './authentication-track.interface';
import {
  AuthenticationActions,
  AuthenticationStates,
} from './authentication-actions.enum';
import { LoggerService } from '@fc/shared/logger/logger.service';

@Controller()
export class AuthenticationController {
  public constructor(private readonly logger: LoggerService) {}

  private track(log: IAuthenticationTrack) {
    this.logger.businessEvent(log);
  }

  @Get('first-login/:token')
  @Render('login')
  public firstLoginView(@Req() req) {
    const csrfToken = req.csrfToken();
    return { csrfToken, showTotpField: false };
  }

  @Post('first-login/:token')
  @UseGuards(new LocalAuthGuard())
  public firstLogin(@Req() req, @Res() res) {
    this.track({
      action: AuthenticationActions.TOKEN_SIGNUP,
      state: AuthenticationStates.GRANTED,
      user: req.user.username,
    });

    return res.redirect(`${res.locals.APP_ROOT}/`);
  }

  @Get('login')
  @Render('login')
  public loginView(@Req() req) {
    const csrfToken = req.csrfToken();
    return { csrfToken, showTotpField: true };
  }

  @Post('login')
  @UseGuards(new LocalAuthGuard())
  public login(@Req() req, @Res() res) {
    this.track({
      action: AuthenticationActions.SIGNIN,
      state: AuthenticationStates.GRANTED,
      user: req.user.username,
    });
    return res.redirect(`${res.locals.APP_ROOT}/`);
  }

  @Get('logout')
  public async logout(@Req() req, @Res() res) {
    if (req.user) {
      this.track({
        action: AuthenticationActions.SIGNOUT,
        user: req.user.username,
      });
    }

    const sessionDestroy = promisify(req.session.destroy.bind(req.session));
    const sessionRegenerate = promisify(
      req.session.regenerate.bind(req.session),
    );

    await sessionDestroy();
    await sessionRegenerate();
    req.logout();
    return res.redirect(`${res.locals.APP_ROOT}/login`);
  }
}
