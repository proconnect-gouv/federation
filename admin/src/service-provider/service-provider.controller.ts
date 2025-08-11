import { Repository } from 'typeorm';
import {
  Controller,
  Get,
  Render,
  Post,
  Body,
  UseInterceptors,
  Req,
  Res,
  Param,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../user/roles.enum';
import { Roles } from '../authentication/decorator/roles.decorator';
import { FormErrorsInterceptor } from '../form/interceptor/form-errors.interceptor';
import {
  nullableArrayToDefaultNoneOrLines,
  arrayToLines,
  toEmptiableString,
} from '../utils/transforms/string.transform';
import { ScopesService } from '../scopes';
import { Claims, ClaimsService } from '../claims';
import { ServiceProvider } from './service-provider.mongodb.entity';
import { ServiceProviderService } from './service-provider.service';
import { ServiceProviderDto } from './dto/service-provider-input.dto';
import { DeleteServiceProviderDto } from './dto/delete-service-provider.dto';
import { GenerateNewClientSecretDTO } from './dto/generate-new-client-secret.dto';
import { PaginationSortDirectionType } from '../pagination';

@Controller('service-provider')
export class ServiceProviderController {
  constructor(
    @InjectRepository(ServiceProvider, 'fc-mongo')
    private readonly serviceProviderRepository: Repository<ServiceProvider>,
    private readonly serviceProviderService: ServiceProviderService,
    private readonly scopesService: ScopesService,
    private readonly claimsService: ClaimsService,
  ) {}

  /**
   * Lists the service providers
   */
  @Get()
  @Roles(UserRole.OPERATOR, UserRole.SECURITY)
  @Render('service-provider/list')
  async list(
    @Req() req,
    @Query('search') querySearch?: string,
    @Query('sortField') querySortField?: string,
    @Query('sortDirection')
    querySortDirection: PaginationSortDirectionType = 'asc',
    @Query('page') queryPage: string = '1',
    @Query('limit') queryLimit: string = '10',
  ) {
    const activeServiceProvidersCount = await this.serviceProviderRepository.countBy(
      { active: true },
    );

    const page = parseInt(queryPage, 10);
    const limit = parseInt(queryLimit, 10);
    const csrfToken = req.csrfToken();

    const { items, total } = await this.serviceProviderService.paginate({
      page,
      limit,
      search: querySearch
        ? { fields: ['name', 'key'], value: querySearch }
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
      serviceProviders: items,
      total,
      activeServiceProvidersCount,
      csrfToken,
      page,
      limit,
      querySortField,
      querySortDirection,
      querySearch,
    };
  }

  /**
   * Displays the service provider creation form.
   */
  @Get('create')
  @Render('service-provider/creation')
  @Roles(UserRole.OPERATOR)
  async showCreationForm(@Req() req) {
    const csrfToken = req.csrfToken();
    const scopesGroupedByFd = await this.scopesService.getScopesGroupedByFd();

    const claims: Claims[] = await this.claimsService.getAll();

    const response = {
      csrfToken,
      scopesGroupedByFd,
      claims,
      claimsSelected: ['amr'],
    };

    return response;
  }

  /**
   * Creates a service provider
   */
  @Post('create')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor(`/service-provider/create`))
  async createServiceProvider(
    @Body() createServiceProviderDto: ServiceProviderDto,
    @Req() req,
    @Res() res,
  ) {
    try {
      await this.serviceProviderService.createServiceProvider(
        createServiceProviderDto,
        req.user.username,
      );
    } catch (error) {
      req.flash(
        'globalError',
        "Impossible d'enregistrer le fournisseur de service",
      );
      req.flash('values', createServiceProviderDto);

      return res.redirect(`${res.locals.APP_ROOT}/service-provider/create`);
    }
    req.flash(
      'success',
      `Le fournisseur de service ${createServiceProviderDto.name} a été créé avec succès !`,
    );

    return res.redirect(`${res.locals.APP_ROOT}/`);
  }

  /**
   *  Displays the service provider update form
   */
  @Get(':id')
  @Roles(UserRole.OPERATOR)
  @Render('service-provider/update')
  async findOne(@Param('id') id, @Req() req) {
    const csrfToken = req.csrfToken();

    const serviceProvider = await this.serviceProviderService.findById(id);
    const output = {
      ...serviceProvider,
      redirectUri: arrayToLines(serviceProvider.redirect_uris),
      site: arrayToLines(serviceProvider.site),
      ipsRanges: arrayToLines(serviceProvider.IPServerAddressesAndRanges),
      postLogoutUri: arrayToLines(serviceProvider.post_logout_redirect_uris),
      emails: Array.isArray(serviceProvider.email)
        ? arrayToLines(serviceProvider.email)
        : this.formatEmailFields(serviceProvider.email),
      response_types: nullableArrayToDefaultNoneOrLines({
        value: serviceProvider.response_types,
      }),
      grant_types: nullableArrayToDefaultNoneOrLines({
        value: serviceProvider.grant_types,
      }),
      userinfo_signed_response_alg: toEmptiableString({
        value: serviceProvider.userinfo_signed_response_alg,
      }),
    };

    /**
     * We want to send to the view all the fields that the user
     * has updated if there was an error plus all the fields
     * that were not updated.
     */
    if (req.session.flash && req.session.flash.errors) {
      Object.assign(req.session.flash.values[0], output);
    } else {
      req.flash('values', output);
    }

    const scopesSelected: string[] = serviceProvider.scopes || [];
    const scopesGroupedByFd = await this.scopesService.getScopesGroupedByFd();

    const claimsSelected: string[] = serviceProvider.claims || ['amr'];
    const claims: Claims[] = await this.claimsService.getAll();

    const response = {
      csrfToken,
      id,
      claimsSelected,
      claims,
      scopesGroupedByFd,
      scopesSelected,
    };

    return response;
  }
  /**
   * Updates a service provider
   */
  @Patch(':id')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor(`/service-provider/:id`))
  async serviceProviderUpdate(
    @Body() updateServiceProviderDto: ServiceProviderDto,
    @Param('id') id,
    @Req() req,
    @Res() res,
  ) {
    try {
      await this.serviceProviderService.update(
        id,
        updateServiceProviderDto,
        req.user.username,
      );
    } catch (error) {
      req.flash('globalError', 'Impossible de mettre à jour le FS');
      return res.redirect(`${res.locals.APP_ROOT}/service-provider/${id}`);
    }
    req.flash(
      'success',
      `Le fournisseur de service ${updateServiceProviderDto.name} a été modifié avec succès !`,
    );

    return res.redirect(`${res.locals.APP_ROOT}/service-provider/${id}`);
  }

  /**
   * Deletes a service provider
   */
  @Delete(':id')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor('/service-provider'))
  async deleteServiceProvider(
    @Param('id') id: string,
    @Req() req,
    @Res() res,
    @Body() body,
  ) {
    try {
      await this.serviceProviderService.deleteServiceProviderById(
        id,
        req.user.username,
      );
    } catch (error) {
      req.flash('globalError', error.message);
      return res.status(500);
    }
    req.flash(
      'success',
      `Le fournisseur de service ${body.name} a été supprimé avec succès !`,
    );
    return res.redirect(`${res.locals.APP_ROOT}/service-provider`);
  }

  /**
   * Deletes multiple service providers
   */
  @Post('delete')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor('/service-provider'))
  async deleteServiceProviders(
    @Body() body: DeleteServiceProviderDto,
    @Res() res,
    @Req() req,
  ) {
    const { deleteItems = [], name } = body;
    try {
      await this.serviceProviderService.deleteManyServiceProvidersById(
        deleteItems,
        req.user.username,
      );
    } catch (error) {
      req.flash('globalError', error.message);
      return res.status(500);
    }
    req.flash(
      'success',
      `Les fournisseurs de service ${name} ont été supprimés avec succès !`,
    );
    return res.redirect(`${res.locals.APP_ROOT}/service-provider`);
  }

  /**
   * Displays the form for generating a new client secret
   */
  @Get('update/:id/secret')
  @Roles(UserRole.OPERATOR)
  @Render('service-provider/generate-new-client-secret')
  async generateNewSecret(@Param('id') id: string, @Req() req, @Res() res) {
    const csrfToken = req.csrfToken();

    /**
     * If we have an error to flash, we want to render the last user inputs,
     * not the service-provider in database.
     */
    if (req.session.flash && req.session.flash.errors) {
      return {
        csrfToken,
        id,
      };
    }

    const serviceProvider = await this.serviceProviderService.findById(id);
    return {
      csrfToken,
      id,
      messages: {
        values: [serviceProvider],
      },
    };
  }

  /**
   * Generates a new client secret for a service provider
   */
  @Patch('update/:id/secret')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(
    new FormErrorsInterceptor('/service-provider/update/:id/secret'),
  )
  async generateNewClientSecret(
    @Param('id') id: string,
    @Body() generateNewClientSecretDTO: GenerateNewClientSecretDTO,
    @Req() req,
    @Res() res,
  ) {
    try {
      await this.serviceProviderService.generateNewSecret(
        id,
        req.user.username,
      );
    } catch (error) {
      req.flash('gobalError', error);
      return res.status(500);
    }

    req.flash(
      'success',
      `Le nouveau client secret du fournisseur de service ${generateNewClientSecretDTO.name} a été généré avec succés !`,
    );

    return res.redirect(`${res.locals.APP_ROOT}/service-provider`);
  }

  private formatEmailFields(emails: string): string {
    if (typeof emails !== 'string') {
      return '';
    }
    return emails.replace(/,/g, '\r\n');
  }
}
