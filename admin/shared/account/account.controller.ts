import { UserRole } from '@fc/shared/user/roles.enum';
import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Render,
  Req,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from '@fc/shared/user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EnrollUserDto } from './dto/enroll-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@fc/shared/user/user.sql.entity';
import { Roles } from '@fc/shared/authentication/decorator/roles.decorator';
import { FormErrorsInterceptor } from '@fc/shared/form/interceptor/form-errors.interceptor';
import { AccountService } from './account.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { TotpService } from '@fc/shared/authentication/totp/totp.service';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('account')
export class AccountController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly totpService: TotpService,
  ) {}

  @Get('/create')
  @Roles(UserRole.ADMIN)
  @Render('account/creation')
  showCreationForm(@Req() req) {
    const csrfToken = req.csrfToken();
    const tmpPassword = this.userService.generateTmpPass();
    return { csrfToken, tmpPassword };
  }

  @Post('create')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(new FormErrorsInterceptor(`/account/create`))
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(
    @Body() { username, email, password, roles }: CreateUserDto,
    @Req() req,
    @Res() res,
  ) {
    const rolesToRegister = roles.map(role => `inactive_${role}`);
    rolesToRegister.push('new_account');

    const newAccount: CreateUserDto = {
      username,
      email,
      password,
      roles: rolesToRegister as UserRole[],
      secret: this.totpService.generateTotpSecret(),
    };

    try {
      await this.userService.createUser(newAccount, req.user.username);
    } catch (error) {
      req.flash('globalError', { code: '23505' });
      return res.redirect(`${res.locals.APP_ROOT}/account/create`);
    }
    req.flash(
      'success',
      `L'utilisateur ${newAccount.username} a été créé avec succès !`,
    );
    return res.redirect(`${res.locals.APP_ROOT}/account`);
  }

  @Get('enrollment')
  @Roles(UserRole.NEWUSER)
  @Render('account/enrollment')
  public async firstLogin(@Req() req, @Res() res) {
    const {
      user,
      issuer,
      secret,
      QRCode,
      step,
      algorithm,
    } = await this.totpService.generateTotpQRCode(req.user);
    const csrfToken = req.csrfToken();

    return {
      csrfToken,
      user,
      issuer,
      secret,
      QRCode,
      step,
      algorithm,
    };
  }

  @Patch('enrollment')
  @Roles(UserRole.NEWUSER)
  @UseInterceptors(new FormErrorsInterceptor(`/account/enrollment`))
  @UsePipes(ValidationPipe)
  async enrollUser(
    @Body() enrollUserDto: EnrollUserDto,
    @Req() req,
    @Res() res,
  ) {
    const validPassword = this.userService.passwordDoesNotContainUsername(
      req.body.password,
      req.user.username,
    );

    const isEqualToTemporaryPassword = await this.userService.isEqualToTemporaryPassword(
      req.body.password,
      req.user.passwordHash,
    );

    if (isEqualToTemporaryPassword) {
      req.flash(
        'globalError',
        'Votre nouveau mot de passe ne peut pas être le mot de passe temporaire.',
      );
      return res.redirect(`${res.locals.APP_ROOT}/account/enrollment`);
    }

    if (!validPassword) {
      req.flash(
        'globalError',
        "Votre nouveau mot de passe contient votre nom d'utilisateur",
      );
      return res.redirect(`${res.locals.APP_ROOT}/account/enrollment`);
    }

    try {
      await this.userService.enrollUser(req.user, enrollUserDto);
    } catch (error) {
      req.flash('globalError', `L\'utilisateur n'a pas pu être mis à jour`);
      return res.redirect(`${res.locals.APP_ROOT}/account/enrollment`);
    }
    req.flash('success', `Le mot de passe a bien été mis à jour !`);
    return res.redirect(`${res.locals.APP_ROOT}/`);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(new FormErrorsInterceptor('/account'))
  async deleteUser(
    @Param('id', new ParseUUIDPipe()) id,
    @Req() req,
    @Res() res,
  ): Promise<any> {
    if (req.user.id === id) {
      req.flash(
        'globalError',
        'Merci de ne pas essayer de vous supprimez vous même ;)',
      );
      return res.redirect(`${res.locals.APP_ROOT}/account`);
    }

    try {
      await this.userService.deleteUserById(id, req.user.username);
      req.flash(
        'success',
        `Le compte ${req.body.username} a été supprimé avec succès !`,
      );
      return res.redirect(`${res.locals.APP_ROOT}/account`);
    } catch (error) {
      req.flash('globalError', error);
      return res.status(500);
    }
  }

  @Get('me')
  @Render('account/userAccount')
  async showUserAccount(@Req() req) {
    const csrfToken = req.csrfToken();
    const {
      user,
      issuer,
      secret,
      QRCode,
      step,
      algorithm,
    } = await this.totpService.generateTotpQRCode(req.user);
    return {
      csrfToken,
      user,
      issuer,
      secret,
      QRCode,
      step,
      algorithm,
    };
  }

  @Patch('update-account/:username')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.SECURITY)
  @UseInterceptors(new FormErrorsInterceptor(`/account/me`))
  @UsePipes(ValidationPipe)
  async updateUserPassword(
    @Body() updateAccountDto: UpdateAccountDto,
    @Req() req,
    @Res() res,
  ) {
    const validPassword = this.userService.passwordDoesNotContainUsername(
      req.body.password,
      req.user.username,
    );

    if (!validPassword) {
      req.flash(
        'globalError',
        "Votre nouveau mot de passe contient votre nom d'utilisateur",
      );
      return res.redirect(`${res.locals.APP_ROOT}/account/me`);
    }

    const isEqualToOneOfTheLastFivePasswords = await this.userService.isEqualToOneOfTheLastFivePasswords(
      req.user.username,
      req.body.password,
    );

    if (isEqualToOneOfTheLastFivePasswords) {
      req.flash(
        'globalError',
        "Votre nouveau mot de passe ne peut être l'un des cinq derniers mots de passe utilisés",
      );
      return res.redirect(`${res.locals.APP_ROOT}/account/me`);
    }

    try {
      await this.userService.updateUserAccount(req.user, updateAccountDto);
    } catch (error) {
      req.flash(
        'globalError',
        'Nouveau mot de passe non mis à jour, Ancien mot de passe incorrect.',
      );
      return res.redirect(`${res.locals.APP_ROOT}/account/me`);
    }
    req.flash('success', `Le mot de passe a bien été mis à jour !`);
    return res.redirect(`${res.locals.APP_ROOT}/`);
  }

  @Get()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SECURITY)
  @Render('account/list')
  async list(
    @Req() req,
    @Query('page') pageQuery: string = '0',
    @Query('limit') limitQuery: string = '10',
  ) {
    const page = parseInt(pageQuery, 10);
    const limit = parseInt(limitQuery, 10);

    const csrfToken = req.csrfToken();
    const users: Pagination<User> = await this.accountService.paginate({
      page,
      limit,
      route: '/account',
    });

    return {
      users: users.items,
      total: users.totalItems,
      csrfToken,
      page,
      limit,
    };
  }
}
