import { Body, Controller, Get, Post, Redirect, Render } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { IExposedSessionServiceGeneric, Session } from '@fc/session-generic';
import {
  RequestHandlerDTO,
  EidasProviderConfig,
  EidasProviderSession,
} from './dto';
import { EidasProviderService } from './eidas-provider.service';

@Controller('eidas-provider')
export class EidasProviderController {
  constructor(
    private readonly config: ConfigService,
    private readonly eidasProvider: EidasProviderService,
  ) {}

  /**
   * Temporary controller to handle the request
   * and send directly a preformatted response
   * @param body The body of the request, containing a light-request token
   * @returns The light-response token and the URL where it should be posted
   */
  @Post('/request-handler')
  @Redirect()
  async requestHandler(
    @Body() body: RequestHandlerDTO,
    @Session('EidasProvider')
    session: IExposedSessionServiceGeneric<EidasProviderSession>,
  ) {
    const { token } = body;

    const lightRequest = await this.eidasProvider.readLightRequestFromCache(
      token,
    );

    const request = this.eidasProvider.parseLightRequest(lightRequest);

    await session.set('eidasRequest', request);

    const {
      redirectAfterRequestHandlingUrl,
    } = this.config.get<EidasProviderConfig>('EidasProvider');

    return { url: redirectAfterRequestHandlingUrl, statusCode: 302 };
  }

  @Get('/response-proxy')
  @Render('redirect-to-fr-node-proxy-service')
  async responseProxy(
    @Session('EidasProvider')
    session: IExposedSessionServiceGeneric<EidasProviderSession>,
  ) {
    const eidasReponse = await this.getEidasResponse(session);

    const { token, lightResponse } = this.eidasProvider.prepareLightResponse(
      eidasReponse,
    );

    await this.eidasProvider.writeLightResponseInCache(
      eidasReponse.id,
      lightResponse,
    );

    const {
      proxyServiceResponseCacheUrl,
    } = this.config.get<EidasProviderConfig>('EidasProvider');

    return { proxyServiceResponseCacheUrl, token };
  }

  private async getEidasResponse(
    session: IExposedSessionServiceGeneric<EidasProviderSession>,
  ) {
    const {
      eidasRequest,
      partialEidasResponse,
    }: EidasProviderSession = await session.get();

    let eidasReponse;
    if (!partialEidasResponse.status.failure) {
      eidasReponse = this.eidasProvider.completeFcSuccessResponse(
        partialEidasResponse,
        eidasRequest,
      );
    } else {
      eidasReponse = this.eidasProvider.completeFcFailureResponse(
        partialEidasResponse,
        eidasRequest,
      );
    }

    return eidasReponse;
  }
}
