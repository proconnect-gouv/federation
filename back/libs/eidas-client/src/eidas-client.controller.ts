import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { EidasClientService } from './eidas-client.service';
import { CallbackDTO, EidasClientConfig } from './dto';

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
  @Render('redirect-to-fr-node-connector')
  async redirectToFrNode() {
    const tmpRequest: any = {
      id: `${+new Date()}`,
      citizenCountryCode: 'BE',
      issuer: 'EIDASBridge Connector',
      levelOfAssurance: 'low',
      nameIdFormat: 'unspecified',
      providerName: 'FranceConnect',
      spType: 'public',
      relayState: 'myState',
      requestedAttributes: [
        'PersonIdentifier',
        'CurrentFamilyName',
        'CurrentGivenName',
        'DateOfBirth',
        'CurrentAddress',
        'Gender',
        'BirthName',
        'PlaceOfBirth',
      ],
    };

    const { token, lightRequest } = this.eidasClient.prepareLightRequest(
      tmpRequest,
    );

    await this.eidasClient.writeLightRequestInCache(
      tmpRequest.id,
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
  @Post('/callback')
  async callback(@Body() body: CallbackDTO) {
    const { token } = body;

    const lightResponse = await this.eidasClient.readLightResponseFromCache(
      token,
    );

    return this.eidasClient.parseLightResponse(lightResponse);
  }
}
