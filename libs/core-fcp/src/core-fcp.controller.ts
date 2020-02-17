import {
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { CoreFcpService } from './core-fcp.service';
import { AuthorizeInputDTO } from './dto/authorize-input.dto';

@Controller('/api/v2')
export class CoreFcpController {
  constructor(private readonly coreFcpService: CoreFcpService) {}

  @Get('/authorize')
  @UsePipes(new ValidationPipe({ transform: true }))
  authorize(@Query() query: AuthorizeInputDTO): string {
    return this.coreFcpService.getAuthorize(query);
  }

  @Get('/redirect-to-idp')
  getRedirectToIdp(): string {
    return this.coreFcpService.getRedirectToIdp();
  }

  @Get('/oidc-callback')
  getOidcCallback(): string {
    return this.coreFcpService.getOidcCallback();
  }

  @Get('/consent')
  getConsent(): string {
    return this.coreFcpService.getConsent();
  }

  @Post('/consent')
  postConsent(): string {
    return this.coreFcpService.postConsent();
  }

  @Get('/client/.well-known')
  getClientWellKnown(): string {
    return this.coreFcpService.getClientWellKnown();
  }

  @Get('/provider/.well-known')
  getProviderWellKnown(): string {
    return this.coreFcpService.getProviderWellKnown();
  }
}
