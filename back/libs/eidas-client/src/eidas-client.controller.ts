import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Query,
  UsePipes,
  ValidationPipe,
  Redirect,
} from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { EidasClientService } from './eidas-client.service';
import {
  ReponseHandlerDTO,
  EidasClientConfig,
  EidasClientSession,
  ValidateEuropeanIdentity,
} from './dto';
import { IExposedSessionServiceGeneric, Session } from '@fc/session-generic';

@Controller('eidas-client')
export class EidasClientController {
  constructor(
    private readonly config: ConfigService,
    private readonly eidasClient: EidasClientService,
  ) {}

  /**
   * A temporary controller who format a hardcoded temporary request to a
   * light-request before writing it to an ignite cache and then returning
   * the informations for a form to call the FR Node.
   * @returns The light-request token and the URL where it should be posted
   */
  @Get('/redirect-to-fr-node-connector')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('redirect-to-fr-node-connector')
  async redirectToFrNode(
    @Query() query: ValidateEuropeanIdentity,
    @Session('EidasClient')
    session: IExposedSessionServiceGeneric<EidasClientSession>,
  ) {
    const eidasPartialRequest = await session.get('eidasPartialRequest');

    const eidasRequest = this.eidasClient.completeEidasRequest(
      eidasPartialRequest,
      query.country,
    );

    await session.set('eidasRequest', eidasRequest);

    const { token, lightRequest } = this.eidasClient.prepareLightRequest(
      eidasRequest,
    );

    await this.eidasClient.writeLightRequestInCache(
      eidasRequest.id,
      lightRequest,
    );

    const { connectorRequestCacheUrl } = this.config.get<EidasClientConfig>(
      'EidasClient',
    );

    return {
      connectorRequestCacheUrl,
      token,
    };
  }

  /**
   * Temporary controller to handle the response
   * @param body The body of the response, containing a light-response token
   * @returns The identity found in the light-response as a JSON
   */
  @Redirect()
  @Post('/response-handler')
  async responseHandler(
    @Body() body: ReponseHandlerDTO,
    @Session('EidasClient')
    session: IExposedSessionServiceGeneric<EidasClientSession>,
  ) {
    const { token } = body;

    const lightResponse = await this.eidasClient.readLightResponseFromCache(
      token,
    );

    const eidasResponse = this.eidasClient.parseLightResponse(lightResponse);

    await session.set('eidasResponse', eidasResponse);

    const {
      redirectAfterResponseHandlingUrl,
    } = this.config.get<EidasClientConfig>('EidasClient');

    return { url: redirectAfterResponseHandlingUrl, statusCode: 302 };
  }
}
