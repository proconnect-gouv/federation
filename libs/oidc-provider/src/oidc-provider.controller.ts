import {
  Controller,
  Get,
  Next,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import { GetAuthorizeParamsDTO } from './dto';
import { IIdentityManagementService, ISpManagementService } from './interfaces';
import { IDENTITY_MANAGEMENT_SERVICE, SP_MANAGEMENT_SERVICE } from './tokens';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from './oidc-provider.service';

@Controller('/api/v2')
export class OidcProviderController {
  constructor(
    @Inject(IDENTITY_MANAGEMENT_SERVICE)
    private readonly identityManagementService: IIdentityManagementService,
    @Inject(SP_MANAGEMENT_SERVICE)
    private readonly spManagementService: ISpManagementService,
    private readonly loggerService: LoggerService,
    private readonly oidcProdiverService: OidcProviderService,
  ) {
    this.loggerService.setContext(this.constructor.name);
  }

  /** @TODO validation query by DTO (current DTO is almost empty) */
  @Get('/authorize')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getAuthorize(@Next() next, @Query() params: GetAuthorizeParamsDTO) {
    // Start of business related stuff
    this.loggerService.debug('/api/v2/authorize');
    this.loggerService.businessEvent('### NEST /api/v2/authorize');

    const { client_id: clientId } = params;

    this.checkIfSpIsUsable(clientId);

    // Pass the query to oidc-provider
    return next();
  }

  /** @TODO validation query by DTO */
  @Post('/token')
  postToken(@Next() next) {
    // Start of business related stuff
    this.loggerService.debug('/api/v2/token');

    /**
     * Disabled for now:
     * @TODO client_id and client_secret are sent in authorization header
     * We can extract client_id to do the "isUsable" check
     * ~> this.checkIfSpIsUsable(clientId);
     */

    // Pass the query to oidc-provider
    return next();
  }

  /** @TODO validation query by DTO */
  // (authorisation header, do we really need to add DTO check? 🤔)
  @Get('/userinfo')
  async getUserInfo(@Next() next) {
    // Start of business related stuff
    this.loggerService.debug('/api/v2/userinfo');
    // End of business related stuff
    return next();
  }

  @Get('/.well-known/keys')
  async getWellKnownKeys() {
    this.loggerService.debug('api/v2/.well-known/keys');
    return this.oidcProdiverService.wellKnownKeys();
  }

  /**
   * @TODO Implement proper error management
   */
  private async checkIfSpIsUsable(clientId) {
    if (!(await this.spManagementService.isUsable(clientId))) {
      throw new Error('SP not usable!');
    }
  }
}
