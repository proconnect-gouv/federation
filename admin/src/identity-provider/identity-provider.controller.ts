import {
  Controller,
  Get,
  Patch,
  Req,
  Res,
  Render,
  Query,
  Post,
  Param,
  Body,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../authentication/decorator/roles.decorator';
import { UserRole } from '../user/roles.enum';
import { FormErrorsInterceptor } from '../form/interceptor/form-errors.interceptor';
import { IdentityProviderService } from './identity-provider.service';
import { IdentityProviderDTO } from './dto/identity-provider.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationSortDirectionType } from '../pagination';

@Controller('identity-provider')
export class IdentityProviderController {
  constructor(
    private readonly identityProviderService: IdentityProviderService,
  ) {}

  /**
   * Lists the identity providers
   */
  @Get()
  @Roles(UserRole.OPERATOR, UserRole.SECURITY)
  @Render('identity-provider/list')
  async list(
    @Req() req,
    @Query('search') querySearch?: string,
    @Query('sortField') querySortField?: string,
    @Query('sortDirection')
    querySortDirection: PaginationSortDirectionType = 'asc',
    @Query('page') queryPage: string = '1',
    @Query('limit') queryLimit: string = '10',
  ) {
    const page = parseInt(queryPage, 10);
    const limit = parseInt(queryLimit, 10);
    const csrfToken = req.csrfToken();

    const { items: paginatedIdentityProviders, total: totalItems } =
      await this.identityProviderService.paginate({
        page,
        limit,
        search: querySearch
          ? { fields: ['name', 'title', 'clientID'], value: querySearch }
          : undefined,
        sort: querySortField
          ? { field: querySortField, direction: querySortDirection }
          : undefined,
        defaultSort: {
          field: 'createdAt',
          direction: 'desc',
        },
      });

    return {
      identityProviders: paginatedIdentityProviders,
      totalItems,
      csrfToken,
      page,
      limit,
      querySortField,
      querySortDirection,
      querySearch,
    };
  }

  /**
   * Displays the identity provider creation form
   */
  @Get('create')
  @Roles(UserRole.OPERATOR)
  @Render('identity-provider/creation')
  async showCreationForm(@Req() req) {
    const csrfToken = req.csrfToken();
    const identityProvidersCount =
      await this.identityProviderService.countIdentityProviders();

    // TODO
    // Potentielle refacto pour généraliser la gestion des failures de TOTP
    if (req.session.flash && req.session.flash.errors) {
      const postedValues = plainToInstance(
        IdentityProviderDTO,
        req.session.flash.values[0],
      );
      // Keep the user last inputs when displaying an error in the form
      req.session.flash.values[0] = Object.assign({}, postedValues);
    }

    return {
      csrfToken,
      identityProvidersCount,
    };
  }

  /**
   * Creates an identity provider
   */
  @Post('create')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor(`/identity-provider/create`))
  async createIdentityProvider(
    @Body() identityProviderDto: IdentityProviderDTO,
    @Req() req,
    @Res() res,
  ) {
    try {
      const { hasGristPublicationSucceeded } =
        await this.identityProviderService.create(
          identityProviderDto,
          req.user.username,
        );
      if (!hasGristPublicationSucceeded) {
        req.flash('globalError', { code: 'GRIST_PUBLICATION_FAILED' });
      }
    } catch (error) {
      req.flash('globalError', error.message);
      req.flash('values', req.body);
      return res.redirect(`${res.locals.APP_ROOT}/identity-provider/create`);
    }
    req.flash(
      'success',
      `Le fournisseur d'identité ${identityProviderDto.name} a été créé avec succès !`,
    );
    return res.redirect(`${res.locals.APP_ROOT}/identity-provider`);
  }

  /**
   * Displays the identity provider update form
   */
  @Get(':id')
  @Roles(UserRole.OPERATOR)
  @Render('identity-provider/update')
  async findOne(@Param('id') id, @Req() req) {
    const csrfToken = req.csrfToken();

    // we map the entity as a DTO
    const { identityProviderDto } =
      await this.identityProviderService.findById(id);

    // TODO
    // Potentielle refacto pour généraliser la gestion des failures de TOTP
    if (req.session.flash && req.session.flash.errors) {
      const postedValues = plainToInstance(
        IdentityProviderDTO,
        req.session.flash.values[0],
      );

      // Keep the user last inputs when displaying an error in the form
      req.session.flash.values[0] = Object.assign({}, postedValues);
    } else {
      req.flash('values', identityProviderDto);
    }

    return {
      csrfToken,
      id,
    };
  }

  /**
   * Updates an identity provider
   * @TODO: Revoir le contrôle fait par le DTO
   */
  @Patch(':id')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor(`/identity-provider/:id`))
  async identityProviderUpdate(
    @Body() identityProviderDto: IdentityProviderDTO,
    @Param('id') id,
    @Req() req,
    @Res() res,
  ) {
    try {
      const { hasGristPublicationSucceeded } =
        await this.identityProviderService.update(
          id,
          identityProviderDto,
          req.user.username,
        );
      if (!hasGristPublicationSucceeded) {
        req.flash('globalError', { code: 'GRIST_PUBLICATION_FAILED' });
      }
    } catch (error) {
      req.flash('globalError', error.message);
      return res.redirect(`${res.locals.APP_ROOT}/identity-provider/${id}`);
    }

    req.flash(
      'success',
      `Le fournisseur d'identité ${identityProviderDto.title} a été modifié avec succès !`,
    );
    return res.redirect(`${res.locals.APP_ROOT}/identity-provider/${id}`);
  }

  /**
   * Deletes an identity provider
   */
  @Delete(':id')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor('/identity-provider'))
  async deleteIdentityProvider(
    @Param('id') id: string,
    @Req() req,
    @Res() res,
    @Body() body,
  ) {
    try {
      const { hasGristPublicationSucceeded } =
        await this.identityProviderService.deleteIdentityProvider(
          id,
          req.user.username,
        );
      if (!hasGristPublicationSucceeded) {
        req.flash('globalError', { code: 'GRIST_PUBLICATION_FAILED' });
      }
    } catch (error) {
      req.flash('globalError', error.message);
      return res.status(500);
    }

    req.flash(
      'success',
      `Le fournisseur d'identité ${body.name} a été supprimé avec succès !`,
    );
    return res.redirect(`${res.locals.APP_ROOT}/identity-provider`);
  }
}
