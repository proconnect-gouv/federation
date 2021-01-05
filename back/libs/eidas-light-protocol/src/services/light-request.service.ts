import { json2xml, xml2json } from 'xml-js';
import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { EidasRequest } from '@fc/eidas';
import {
  EidasJsonToXmlException,
  EidasXmlToJsonException,
} from '../exceptions';
import { LightRequestXmlSelectors } from '../enums';
import { IParsedToken } from '../interfaces';
import { EidasLightProtocolConfig } from '../dto';
import { LightCommonsService } from './light-commons.service';

@Injectable()
export class LightRequestService {
  constructor(
    private readonly config: ConfigService,
    private readonly lightCommons: LightCommonsService,
  ) {}

  fromJson(jsonData: EidasRequest): string {
    try {
      const options = { compact: true, ignoreComment: true, spaces: 2 };
      return json2xml(JSON.stringify(this.inflateJson(jsonData)), options);
    } catch (error) {
      throw new EidasJsonToXmlException(error);
    }
  }

  generateToken(id: string, issuer: string, date?: Date): string {
    const {
      lightRequestConnectorSecret,
    } = this.config.get<EidasLightProtocolConfig>('EidasLightProtocol');

    return this.lightCommons.generateToken(
      id,
      issuer,
      lightRequestConnectorSecret,
      date,
    );
  }

  toJson(xmlDoc: string): EidasRequest {
    try {
      const options = { compact: true, spaces: 2 };
      return this.deflateJson(JSON.parse(xml2json(xmlDoc, options)));
    } catch (error) {
      throw new EidasXmlToJsonException(error);
    }
  }

  parseToken(token: string): IParsedToken {
    const {
      lightRequestProxyServiceSecret,
    } = this.config.get<EidasLightProtocolConfig>('EidasLightProtocol');

    return this.lightCommons.parseToken(token, lightRequestProxyServiceSecret);
  }

  private inflateJson(json: EidasRequest) {
    const requestedAttributes = json.requestedAttributes.map((attribute) => {
      return {
        definition: {
          _text: `http://eidas.europa.eu/attributes/naturalperson/${_.upperFirst(
            attribute,
          )}`,
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

  private deflateJson(json): EidasRequest {
    const newJson: EidasRequest = {
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

    switch (path) {
      case LightRequestXmlSelectors.LEVEL_OF_ASSURANCE:
      case LightRequestXmlSelectors.NAME_ID_FORMAT:
        final = this.lightCommons.getLastElementInUrlOrUrn(value);
        break;
      case LightRequestXmlSelectors.REQUESTED_ATTRIBUTES:
        final = value
          .map((attribute) => {
            return this.lightCommons.getLastElementInUrlOrUrn(
              attribute.definition._text,
            );
          })
          .map((attribute) => _.lowerFirst(attribute));
        break;
      default:
        final = value;
    }

    return final;
  }
}
