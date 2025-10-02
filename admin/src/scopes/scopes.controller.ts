import { ObjectId } from 'mongodb';
import {
  Controller,
  Get,
  Render,
  UseInterceptors,
  Delete,
  Param,
  Req,
  Res,
  Body,
  Post,
  Patch,
} from '@nestjs/common';
import { Roles } from '../authentication/decorator/roles.decorator';
import { UserRole } from '../user/roles.enum';
import { FormErrorsInterceptor } from '../form/interceptor/form-errors.interceptor';

import { IScopes } from './interface';
import { ScopesService } from './scopes.service';

const ACTION_CREATE = 'creation';

@Controller('scopes')
export class ScopesController {
  constructor(private readonly scopesService: ScopesService) {}
  /**
   * Lists the scopes and labels
   */
  @Get('label')
  @Roles(UserRole.OPERATOR, UserRole.SECURITY)
  @Render('scopes/label/list')
  async list(@Req() req) {
    // Retrieve scopes
    const scopesAndLabelsList = await this.scopesService.getAll();

    const csrfToken = req.csrfToken();

    const result = {
      scopesAndLabelsList,
      csrfToken,
    };

    return result;
  }

  /**
   * Displays the scope creation form
   */
  @Get('label/create')
  @Roles(UserRole.OPERATOR)
  @Render('scopes/label/creation')
  async showCreateScopeForm(@Req() req) {
    const csrfToken = req.csrfToken();
    const scopesGroupedByFd = await this.scopesService.getScopesGroupedByFd();

    return { csrfToken, scopesGroupedByFd };
  }

  /**
   * Create a label
   */
  @Post('label/create')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor(`/scopes/label/create`))
  async createScopeAndLabels(@Body() scope: IScopes, @Req() req, @Res() res) {
    try {
      await this.scopesService.create(scope, req.user.username);
    } catch (error) {
      req.flash('globalError', "Impossible d'enregistrer le label");
      req.flash('values', scope);

      return res.redirect(`${res.locals.APP_ROOT}/scopes/label/create`);
    }
    req.flash(
      'success',
      `Le label ${scope.label} pour le scope ${scope.scope} a été créé avec succès !`,
    );
    return res.redirect(`${res.locals.APP_ROOT}/scopes/label`);
  }

  /**
   * Displays the scope label update form
   */
  @Get('label/update/:id')
  @Roles(UserRole.OPERATOR)
  @Render('scopes/label/update')
  async showUpdateScopeForm(@Param('id') _id: string, @Req() req) {
    const idMongo = new ObjectId(_id);
    const csrfToken = req.csrfToken();
    const { scope, label, fd } = await this.scopesService.getById(idMongo);
    const scopesGroupedByFd = await this.scopesService.getScopesGroupedByFd();

    return { csrfToken, scope, label, fd, _id, scopesGroupedByFd };
  }

  /**
   * Updates the scope label
   */
  @Patch('label/update/:id')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor(`/scopes/label/update/:id`))
  async updateScopeAndLabels(
    @Body() scopeAndLabel: IScopes,
    @Param('id') id: string,
    @Req() req,
    @Res() res,
  ) {
    try {
      const idMongo = new ObjectId(id);
      await this.scopesService.update(
        idMongo,
        req.user.username,
        scopeAndLabel,
      );
    } catch (error) {
      req.flash('globalError', 'Impossible de modifier le label');
      req.flash('values', scopeAndLabel);

      return res.redirect(`${res.locals.APP_ROOT}/scopes/label/update/${id}`);
    }
    req.flash(
      'success',
      `Le label ${scopeAndLabel.label} a été modifié avec succès !`,
    );
    return res.redirect(`${res.locals.APP_ROOT}/scopes/label`);
  }

  /**
   * Deletes a scope
   */
  @Delete('label/delete/:id')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor('/scopes/label'))
  async deleteScopeAndLabel(
    @Param('id') id: string,
    @Req() req,
    @Res() res,
    @Body() body,
  ) {
    try {
      const idMongo = new ObjectId(id);
      await this.scopesService.remove(idMongo, req.user.username);
    } catch (error) {
      req.flash('globalError', error.message);
      return res.redirect(`${res.locals.APP_ROOT}/scopes/label`);
    }
    req.flash(
      'success',
      `Le scope ${body.scope}:  ${body.label} a été supprimé avec succès !`,
    );
    return res.redirect(`${res.locals.APP_ROOT}/scopes/label`);
  }
}
