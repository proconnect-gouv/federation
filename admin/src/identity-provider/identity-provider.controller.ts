import { ConfigService } from 'nestjs-config';

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
import { Roles } from '@pc/shared/authentication/decorator/roles.decorator';
import { UserRole } from '@pc/shared/user/roles.enum';
import { FormErrorsInterceptor } from '@pc/shared/form/interceptor/form-errors.interceptor';
import { IdentityProviderService } from './identity-provider.service';
import { IdentityProviderDTO } from './dto/identity-provider.dto';
import { plainToClass } from 'class-transformer';
import { Amr } from './enum';
import { FqdnToProviderService } from '../fqdn-to-provider/fqdn-to-provider.service';
import { InstanceService } from '@pc/shared/utils';
import { IIdentityProviderDTO } from './interface';
import { PaginationSortDirectionType } from '@pc/shared/pagination';

@Controller('identity-provider')
export class IdentityProviderController {
  constructor(
    private readonly identityProviderService: IdentityProviderService,
    private readonly fqdnToProviderService: FqdnToProviderService,
    private readonly instanceService: InstanceService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Affiche la liste des fournisseurs d'identité
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

    const {
      items: paginatedIdentityProviders,
      total: totalItems,
    } = await this.identityProviderService.paginate({
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

    let identityProviders = paginatedIdentityProviders;
    const isFcaLow = this.instanceService.isFcaLow();

    if (isFcaLow) {
      identityProviders = (await this.fqdnToProviderService.getProvidersWithFqdns(
        paginatedIdentityProviders as any,
      )) as any[];
    }

    return {
      identityProviders,
      totalItems,
      csrfToken,
      page,
      limit,
      querySortField,
      querySortDirection,
      querySearch,
    };
  }

  @Get('create')
  @Roles(UserRole.OPERATOR)
  @Render('identity-provider/creation')
  async showCreationForm(@Req() req) {
    const csrfToken = req.csrfToken();
    const nbrProviders = await this.identityProviderService.countProviders();

    // TODO
    // Potentielle refacto pour généraliser la gestion des failures de TOTP
    if (req.session.flash && req.session.flash.errors) {
      const postedValues = plainToClass(
        IdentityProviderDTO,
        req.session.flash.values[0],
      );
      // Keep the user last inputs when displaying an error in the form
      req.session.flash.values[0] = Object.assign({}, postedValues);
    }

    const { allowedAcr } = this.config.get('acr');

    return {
      csrfToken,
      nbrProviders,
      amrList: Amr,
      acrList: allowedAcr,
    };
  }

  @Post('create')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor(`/identity-provider/create`))
  async createIdentityProvider(
    @Body() identityProviderDto: IdentityProviderDTO,
    @Req() req,
    @Res() res,
  ) {
    try {
      await this.identityProviderService.create(
        identityProviderDto,
        req.user.username,
      );
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

  @Get(':id')
  @Roles(UserRole.OPERATOR)
  @Render('identity-provider/update')
  async findOne(@Param('id') id, @Req() req) {
    const csrfToken = req.csrfToken();

    // we map the entity as a DTO
    let identityProvider: IIdentityProviderDTO = await this.identityProviderService.findById(
      id,
    );

    const isFcaLow = this.instanceService.isFcaLow();

    // For AgentConnect, we need to add the fqdns
    if (isFcaLow) {
      identityProvider = await this.fqdnToProviderService.getProviderWithFqdns(
        identityProvider,
      );
    }

    // TODO
    // Potentielle refacto pour généraliser la gestion des failures de TOTP
    if (req.session.flash && req.session.flash.errors) {
      const postedValues = plainToClass(
        IdentityProviderDTO,
        req.session.flash.values[0],
      );

      // Keep the user last inputs when displaying an error in the form
      req.session.flash.values[0] = Object.assign({}, postedValues);
    } else {
      req.flash('values', identityProvider);
    }
    const { allowedAcr } = this.config.get('acr');

    return {
      csrfToken,
      id,
      amrSelected: identityProvider?.amr || [],
      acrSelected: identityProvider?.allowedAcr || [],
      amrList: Amr,
      acrList: allowedAcr,
    };
  }

  /**
   * Revoir le contrôle fait par le DTO
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
      await this.identityProviderService.update(
        id,
        identityProviderDto,
        req.user.username,
      );
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
      await this.identityProviderService.deleteIdentityProvider(
        id,
        req.user.username,
      );
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
