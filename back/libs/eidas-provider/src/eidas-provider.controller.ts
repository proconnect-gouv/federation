import { Body, Controller, Post, Render } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { CallbackDTO, EidasProviderConfig } from './dto';
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
  @Post('/callback')
  @Render('redirect-to-fr-node-proxy-service')
  async callback(@Body() body: CallbackDTO) {
    const { token } = body;

    const lightRequest = await this.eidasProvider.readLightRequestFromCache(
      token,
    );

    const request = this.eidasProvider.parseLightRequest(lightRequest);

    const successFullJsonMock: any = {
      id: `${new Date()}`,
      inResponseToId: request.id,
      issuer: 'EIDASBridge ProxyService',
      ipAddress: '127.0.0.1',
      relayState: request.relayState,
      subject:
        '9043a641bacfb18418b571e6d31fabd32307998aeebfb323175e34f81d62351cv1',
      subjectNameIdFormat: 'unspecified',
      levelOfAssurance: request.levelOfAssurance,
      status: {
        failure: 'false',
        statusCode: 'Success',
        statusMessage: 'Hello there :)',
      },
      attributes: {
        personIdentifier:
          'FR/BE/9043a641bacfb18418b571e6d31fabd32307998aeebfb323175e34f81d62351cv1',
        currentFamilyName: 'DUBOIS',
        currentGivenName: ['Angela', 'Claire', 'Louise'],
        dateOfBirth: '1962-08-24',
        currentAddress: {
          poBox: '1234',
          locatorDesignator: '20',
          locatorName: 'Ségur Fontenoy',
          cvaddressArea: 'Paris',
          thoroughfare: 'Avenue de Ségur',
          postName: 'PARIS 7',
          adminunitFirstline: 'FR',
          adminunitSecondline: 'PARIS',
          postCode: '75107',
        },
        gender: 'Female',
        birthName: 'DUBOIS',
        placeOfBirth: '75107',
      },
    };

    const {
      token: responseToken,
      lightResponse,
    } = this.eidasProvider.prepareLightResponse(successFullJsonMock);

    const { proxyServiceResponseCacheUrl } = this.config.get<
      EidasProviderConfig
    >('EidasProvider');

    await this.eidasProvider.writeLightResponseInCache(
      successFullJsonMock.id,
      lightResponse,
    );

    return {
      proxyServiceResponseCacheUrl,
      token: responseToken,
    };
  }
}
