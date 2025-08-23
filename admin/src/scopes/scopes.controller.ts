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
import { ClaimsService, IClaims } from '../claims';

const ACTION_CREATE = 'creation';
const ACTION_UPDATE = 'update';

@Controller('scopes')
export class ScopesController {
  constructor(
    private readonly scopesService: ScopesService,
    private readonly claimsService: ClaimsService,
  ) {}
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

    // Retrieve claims
    const claimsList = await this.claimsService.getAll();
    Object.assign(result, { claimsList });

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
      req.flash(
        'globalError',
        "Impossible d'enregistrer le label (" + error + ')',
      );
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
  async showUpdateScopeForm(@Param('id') id: string, @Req() req) {
    const idMongo: ObjectId = new ObjectId(id);
    const csrfToken = req.csrfToken();
    const { scope, label, fd } = await this.scopesService.getById(idMongo);
    const scopesGroupedByFd = await this.scopesService.getScopesGroupedByFd();

    return { csrfToken, scope, label, fd, id, scopesGroupedByFd };
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
      const idMongo: ObjectId = new ObjectId(id);
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
      const idMongo: ObjectId = new ObjectId(id);
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

  /**
   * Displays the claim creation form
   * @param req
   */
  @Get('claim/create')
  @Roles(UserRole.OPERATOR)
  @Render('scopes/claim/form')
  async showNewClaimForm(@Req() req) {
    const csrfToken = req.csrfToken();
    return { csrfToken, action: ACTION_CREATE };
  }

  /**
   * Creates a claim
   */
  @Post('claim/create')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor(`/scopes/claim/create`))
  async addNewClaim(@Body() body: IClaims, @Req() req, @Res() res) {
    try {
      await this.claimsService.create(body);
    } catch (error) {
      req.flash('globalError', "Impossible d'enregistrer le claim");
      req.flash('values', body);

      return res.redirect(`${res.locals.APP_ROOT}/scopes/label/create`, {
        action: ACTION_CREATE,
      });
    }
    req.flash('success', `Le claim ${body.name} a été créé avec succès !`);
    return res.redirect(`${res.locals.APP_ROOT}/scopes/label`);
  }

  /**
   * Displays the claim update form
   */
  @Get('claim/update/:id')
  @Roles(UserRole.OPERATOR)
  @Render('scopes/claim/form')
  async showUpdateClaimForm(@Param('id') id: string, @Req() req) {
    const csrfToken = req.csrfToken();
    const { name } = await this.claimsService.getById(id);

    return { csrfToken, name, id, action: ACTION_UPDATE };
  }

  /**
   * Updates a claim
   */
  @Patch('claim/update/:id')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor(`/scopes/claim/update/:id`))
  async updateClaim(
    @Body() body: IClaims,
    @Param('id') id: string,
    @Req() req,
    @Res() res,
  ) {
    try {
      await this.claimsService.update(id, body);
    } catch (error) {
      req.flash('globalError', 'Impossible de modifier le claim');
      req.flash('values', body);

      return res.redirect(`${res.locals.APP_ROOT}/scopes/claim/form/${id}`, {
        action: ACTION_UPDATE,
      });
    }
    req.flash('success', `Le claim ${body.name} a été modifié avec succès !`);
    return res.redirect(`${res.locals.APP_ROOT}/scopes/label`);
  }

  /**
   * Deletes a claim
   */
  @Delete('claim/delete/:id')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor('/scopes/label'))
  async removeClaim(
    @Param('id') id: string,
    @Req() req,
    @Res() res,
    @Body() body: IClaims,
  ) {
    try {
      await this.claimsService.remove(id);
    } catch (error) {
      req.flash('globalError', error.message);
      return res.redirect(`${res.locals.APP_ROOT}/scopes/label`);
    }
    req.flash('success', `Le claim ${body.name} a été supprimé avec succès !`);
    return res.redirect(`${res.locals.APP_ROOT}/scopes/label`);
  }
}
