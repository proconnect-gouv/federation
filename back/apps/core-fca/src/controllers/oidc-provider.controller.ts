import {
  Body,
  Controller,
  Get,
  Header,
  Next,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { SetStep } from '@fc/flow-steps';
import { OidcProviderRoutes } from '@fc/oidc-provider';

import { AuthorizeParamsDto } from '../dto';

@Controller()
export class OidcProviderController {
  constructor() {}

  @Get(OidcProviderRoutes.AUTHORIZATION)
  @Header('cache-control', 'no-store')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @SetStep()
  getAuthorize(@Next() next, @Query() _query: AuthorizeParamsDto) {
    // Pass the query to oidc-provider
    return next();
  }

  @Post(OidcProviderRoutes.AUTHORIZATION)
  @Header('cache-control', 'no-store')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @SetStep()
  postAuthorize(@Next() next, @Body() _body: AuthorizeParamsDto) {
    // Pass the query to oidc-provider
    return next();
  }
}
