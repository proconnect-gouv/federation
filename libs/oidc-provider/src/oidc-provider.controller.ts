import {
  Controller,
  Get,
  Next,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  Inject,
  Req,
} from '@nestjs/common';
import { GetAuthorizeParamsDTO } from './dto';
import { IServiceProviderService } from './interfaces';
import { SERVICE_PROVIDER_SERVICE } from './tokens';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from './oidc-provider.service';
import { OidcProviderSPInactiveException } from './exceptions';

@Controller('/api/v2')
export class OidcProviderController {
  constructor(
    @Inject(SERVICE_PROVIDER_SERVICE)
    private readonly serviceProvider: IServiceProviderService,
    private readonly logger: LoggerService,
    private readonly oidcProdiver: OidcProviderService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /** @TODO validation query by DTO (current DTO is almost empty) */
  @Get('/authorize')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getAuthorize(@Next() next, @Query() params: GetAuthorizeParamsDTO) {
    // Start of business related stuff
    this.logger.debug('/api/v2/authorize');
    this.logger.businessEvent('### NEST /api/v2/authorize');

    const { client_id: clientId } = params;

    await this.checkIfSpIsUsable(clientId);

    // Pass the query to oidc-provider
    return next();
  }

  /** @TODO validation query by DTO */
  @Post('/token')
  async postToken(@Next() next, @Req() req) {
    // Start of business related stuff
    this.logger.debug('/api/v2/token');

    const clientId = this.oidcProdiver.decodeAuthorizationHeader(
      req.headers.authorization,
    );
    await this.checkIfSpIsUsable(clientId);

    // Pass the query to oidc-provider
    return next();
  }

  /** @TODO validation query by DTO */
  // (authorisation header, do we really need to add DTO check? 🤔)
  @Get('/userinfo')
  async getUserInfo(@Next() next) {
    // Start of business related stuff
    this.logger.debug('/api/v2/userinfo');
    // End of business related stuff
    return next();
  }

  @Get('/.well-known/keys')
  async getWellKnownKeys() {
    this.logger.debug('api/v2/.well-known/keys');
    return this.oidcProdiver.wellKnownKeys();
  }

  /**
   * @TODO Implement proper error management
   */
  private async checkIfSpIsUsable(clientId) {
    if (!(await this.serviceProvider.isActive(clientId))) {
      throw new OidcProviderSPInactiveException('SP not usable!');
    }
  }
}
