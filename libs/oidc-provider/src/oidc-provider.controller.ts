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
import { OidcProviderRoutes } from './enums';
import { IServiceProviderService } from './interfaces';
import { SERVICE_PROVIDER_SERVICE } from './tokens';
import { OidcProviderSPInactiveException } from './exceptions';

@Controller('/api/v2')
export class OidcProviderController {
  constructor(
    @Inject(SERVICE_PROVIDER_SERVICE)
    private readonly serviceProvider: IServiceProviderService,
  ) {}

  /** @TODO validation query by DTO (current DTO is almost empty) */
  @Get(OidcProviderRoutes.AUTHORIZATION)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async getAuthorize(@Next() next, @Query() params: GetAuthorizeParamsDTO) {
    // Start of business related stuff
    const { client_id: clientId } = params;

    await this.checkIfSpIsUsable(clientId);

    // Pass the query to oidc-provider
    return next();
  }

  /** @TODO validation query by DTO */
  @Post(OidcProviderRoutes.TOKEN)
  async postToken(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  /** @TODO validation query by DTO */
  // (authorisation header, do we really need to add DTO check? 🤔)
  @Get(OidcProviderRoutes.USERINFO)
  async getUserInfo(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.END_SESSION)
  async getLogout(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Post('/logout/confirm')
  async getLogoutConfirm(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  private async checkIfSpIsUsable(clientId) {
    if (!(await this.serviceProvider.isActive(clientId))) {
      throw new OidcProviderSPInactiveException('SP not usable!');
    }
  }
}
