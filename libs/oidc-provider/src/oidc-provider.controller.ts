import {
  Controller,
  Get,
  Next,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import { GetAuthorizeParamsDTO } from './dto';
import { IIdentityManagementService, ISpManagementService } from './interfaces';
import { IDENTITY_MANAGEMENT_SERVICE, SP_MANAGEMENT_SERVICE } from './tokens';
import { LoggerService } from '@fc/logger';

@Controller('/api/v2')
export class OidcProviderController {
  constructor(
    @Inject(IDENTITY_MANAGEMENT_SERVICE)
    private readonly identityManagementService: IIdentityManagementService,
    @Inject(SP_MANAGEMENT_SERVICE)
    private readonly spManagementService: ISpManagementService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext(this.constructor.name);
  }

  /** @TODO validation query by DTO (current DTO is almost empty) */
  @Get('/authorize')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getAuthorize(@Next() next, @Query() params: GetAuthorizeParamsDTO) {
    // Start of business related stuff
    this.loggerService.verbose('### NEST /api/v2/authorize');
    this.loggerService.businessEvent('### NEST /api/v2/authorize');

    const { client_id: clientId } = params;

    this.checkIfSpIsUsable(clientId);

    // Pass the query to oidc-provider
    return next();
  }

  /** @TODO validation query by DTO */
  @Post('/token')
  postToken(@Next() next, @Req() req) {
    // Start of business related stuff
    this.loggerService.verbose('### NEST /api/v2/token');

    /** @TODO get param properly, not from req.body */
    const { client_id: clientId } = req.body;

    this.checkIfSpIsUsable(clientId);

    // Pass the query to oidc-provider
    return next();
  }

  /** @TODO validation query by DTO */
  // (authorisation header, do we really need to add DTO check? 🤔)
  @Get('/userinfo')
  async getUserInfo(@Req() req) {
    // Start of business related stuff
    this.loggerService.verbose('### NEST /api/v2/userinfo');
    this.loggerService.debug(req.headers);
    // End of business related stuff

    // Return userinfo
    /**
     * @TODO retrieve an identifier from token ?
     */
    const id = 'abc42';

    /**
     * @TODO return directly call to service
     * if we don't do anything else with the result
     */
    const userinfo = await this.identityManagementService.getIdentity(id);

    return userinfo;
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
