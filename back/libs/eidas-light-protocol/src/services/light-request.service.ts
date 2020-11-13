import { json2xml, xml2json } from 'xml-js';
import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import {
  EidasJsonToXmlException,
  EidasXmlToJsonException,
} from '../exceptions';
import { LightRequestXmlSelectors } from '../enums';
import { IParsedToken, IRequest } from '../interfaces';
import { EidasLightProtocolConfig } from '../dto';
import { LightCommonsService } from './light-commons.service';

@Injectable()
export class LightRequestService {
  constructor(
    private readonly config: ConfigService,
    private readonly lightCommons: LightCommonsService,
  ) {}

  fromJson(jsonData: IRequest): string {
    try {
      const options = { compact: true, ignoreComment: true, spaces: 2 };
      return json2xml(JSON.stringify(this.inflateJson(jsonData)), options);
    } catch (error) {
      throw new EidasJsonToXmlException(error);
    }
  }

  generateToken(id: string, issuer: string, date?: Date): string {
    const { lightRequestConnectorSecret } = this.config.get<
      EidasLightProtocolConfig
    >('EidasLightProtocol');

    return this.lightCommons.generateToken(
      id,
      issuer,
      lightRequestConnectorSecret,
      date,
    );
  }

  toJson(xmlDoc: string): IRequest {
    try {
      const options = { compact: true, spaces: 2 };
      return this.deflateJson(JSON.parse(xml2json(xmlDoc, options)));
    } catch (error) {
      throw new EidasXmlToJsonException(error);
    }
  }

  parseToken(token: string): IParsedToken {
    const { lightRequestProxyServiceSecret } = this.config.get<
      EidasLightProtocolConfig
    >('EidasLightProtocol');

    return this.lightCommons.parseToken(token, lightRequestProxyServiceSecret);
  }

  private inflateJson(json: IRequest) {
    const requestedAttributes = json.requestedAttributes.map((attribute) => {
      return {
        definition: {
          _text: `http://eidas.europa.eu/attributes/naturalperson/${attribute}`,
        },
      };
    });

    const lightRequest = {
      _declaration: {
        _attributes: {
          version: '1.0',
          encoding: 'UTF-8',
          standalone: 'yes',
        },
      },
      lightRequest: {
        citizenCountryCode: {
          _text: json.citizenCountryCode,
        },
        id: {
          _text: json.id,
        },
        issuer: {
          _text: json.issuer,
        },
        levelOfAssurance: {
          _text: `http://eidas.europa.eu/LoA/${json.levelOfAssurance}`,
        },
        nameIdFormat: {
          _text: `urn:oasis:names:tc:SAML:1.1:nameid-format:${json.nameIdFormat}`,
        },
        providerName: {
          _text: json.providerName,
        },
        spType: {
          _text: json.spType,
        },
        relayState: {
          _text: json.relayState,
        },
        requestedAttributes: {
          attribute: requestedAttributes,
        },
      },
    };

    return lightRequest;
  }

  private deflateJson(json): IRequest {
    const newJson: IRequest = {
      citizenCountryCode: this.getJsonValues(
        json,
        LightRequestXmlSelectors.COUNTRY,
      ),
      id: this.getJsonValues(json, LightRequestXmlSelectors.ID),
      issuer: this.getJsonValues(json, LightRequestXmlSelectors.ISSUER),
      levelOfAssurance: this.getJsonValues(
        json,
        LightRequestXmlSelectors.LEVEL_OF_ASSURANCE,
      ),
      nameIdFormat: this.getJsonValues(
        json,
        LightRequestXmlSelectors.NAME_ID_FORMAT,
      ),
      providerName: this.getJsonValues(
        json,
        LightRequestXmlSelectors.PROVIDER_NAME,
      ),
      spType: this.getJsonValues(
        json,
        LightRequestXmlSelectors.SERVICE_PROVIDER_TYPE,
      ),
      relayState: this.getJsonValues(
        json,
        LightRequestXmlSelectors.RELAY_STATE,
      ),
      requestedAttributes: this.getJsonValues(
        json,
        LightRequestXmlSelectors.REQUESTED_ATTRIBUTES,
      ),
    };

    return newJson;
  }

  /**
   * @TODO split cette fonction
   */
  private getJsonValues(json, path) {
    let final;
    const value = _.get(json, path);

    if (path === LightRequestXmlSelectors.LEVEL_OF_ASSURANCE) {
      final = value.split('/LoA/')[1];
    } else if (path === LightRequestXmlSelectors.NAME_ID_FORMAT) {
      final = value.split('format:')[1];
    } else if (path === LightRequestXmlSelectors.REQUESTED_ATTRIBUTES) {
      final = [];
      value.map((attribute) => {
        final.push(/[^/]*$/.exec(attribute.definition._text)[0]);
      });
    } else {
      final = value;
    }
    return final;
  }
}
