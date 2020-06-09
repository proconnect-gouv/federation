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
  getAuthorize(@Next() next, @Query() _params: GetAuthorizeParamsDTO) {
    // Pass the query to oidc-provider
    return next();
  }

  /** @TODO validation query by DTO */
  @Post(OidcProviderRoutes.TOKEN)
  postToken(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  /** @TODO validation query by DTO */
  // (authorisation header, do we really need to add DTO check? 🤔)
  @Get(OidcProviderRoutes.USERINFO)
  getUserInfo(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Get(OidcProviderRoutes.END_SESSION)
  getLogout(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }

  @Post('/logout/confirm')
  getLogoutConfirm(@Next() next) {
    // Pass the query to oidc-provider
    return next();
  }
}
