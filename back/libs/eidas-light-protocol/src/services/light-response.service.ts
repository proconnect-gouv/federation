import * as _ from 'lodash';
import { json2xml, xml2json } from 'xml-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import {
  EidasResponse,
  EidasResponseStatus,
  EidasResponseAddress,
  EidasResponseAttributes,
  EidasResponseContext,
} from '@fc/eidas';
import { LightResponseXmlSelectors } from '../enums';
import {
  IJsonifiedLightResponseXml,
  IJsonifiedXmlContent,
  IJsonifiedXml,
  IParsedToken,
} from '../interfaces';
import {
  EidasJsonToXmlException,
  EidasXmlToJsonException,
} from '../exceptions';
import { EidasLightProtocolConfig } from '../dto';
import { LightCommonsService } from './light-commons.service';

/**
 * @todo #280 ETQ Bridge eIDAS je peux fournir et interpréter une LightResponse XML - Suite
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/280
 * This file is too big and need to be splitted in the future between
 * generics functions and business functions.
 */
@Injectable()
export class LightResponseService {
  constructor(
    private readonly config: ConfigService,
    private readonly lightCommons: LightCommonsService,
  ) {}

  /**
   * Convert light response from JSON to XML
   * @param {EidasResponse} jsonData
   */
  fromJson(jsonData: EidasResponse): string {
    try {
      const options = { compact: true, ignoreComment: true, spaces: 2 };

      const inflatedJson = this.inflateJson(jsonData);
      const stringifiedJson = JSON.stringify(inflatedJson);

      return json2xml(stringifiedJson, options);
    } catch (error) {
      throw new EidasJsonToXmlException(error);
    }
  }

  generateToken(id: string, issuer: string, date?: Date): string {
    const {
      lightResponseProxyServiceSecret,
    } = this.config.get<EidasLightProtocolConfig>('EidasLightProtocol');

    return this.lightCommons.generateToken(
      id,
      issuer,
      lightResponseProxyServiceSecret,
      date,
    );
  }

  /**
   * Convert light response XML to JSON
   * @param {string} xmlDoc
   */
  toJson(xmlDoc: string): EidasResponse {
    try {
      const options = { compact: true, spaces: 2 };

      const stringifiedJson = xml2json(xmlDoc, options);
      const inflatedJson = JSON.parse(stringifiedJson);

      return this.deflateJson(inflatedJson);
    } catch (error) {
      throw new EidasXmlToJsonException(error);
    }
  }

  parseToken(token: string): IParsedToken {
    const {
      lightResponseConnectorSecret,
    } = this.config.get<EidasLightProtocolConfig>('EidasLightProtocol');

    return this.lightCommons.parseToken(token, lightResponseConnectorSecret);
  }

  private inflateJson(json: EidasResponse): IJsonifiedLightResponseXml {
    const inflatedJson: IJsonifiedLightResponseXml = {
      _declaration: {
        _attributes: {
          version: '1.0',
          encoding: 'UTF-8',
          standalone: 'yes',
        },
      },
      lightResponse: {},
    };

    this.inflateContext(inflatedJson, json);
    this.inflateStatus(inflatedJson, json.status);

    if (json.status.failure === false) {
      this.inflateAttributes(inflatedJson, json.attributes);
    } else {
      // The EidasNode need an empty "attributes" descriptor in case of failure because of the xsd scheme
      inflatedJson.lightResponse.attributes = {};
    }

    return inflatedJson;
  }

  private deflateJson(inflatedJson: IJsonifiedLightResponseXml): EidasResponse {
    const deflatedJson: EidasResponse = {
      ...this.deflateContext(inflatedJson),
      status: this.deflateStatus(inflatedJson),
    };

    if (deflatedJson.status.failure === false) {
      deflatedJson.attributes = this.deflateAttributes(inflatedJson);
    }

    return deflatedJson;
  }

  private inflateStatus(
    inflatedResponse: IJsonifiedLightResponseXml,
    status: EidasResponseStatus,
  ): IJsonifiedLightResponseXml {
    _.set(
      inflatedResponse,
      LightResponseXmlSelectors.STATUS_FAILURE,
      `${status.failure}`,
    );

    if (status.statusCode) {
      _.set(
        inflatedResponse,
        LightResponseXmlSelectors.STATUS_CODE,
        `urn:oasis:names:tc:SAML:2.0:status:${status.statusCode}`,
      );
    }

    if (status.subStatusCode) {
      _.set(
        inflatedResponse,
        LightResponseXmlSelectors.SUB_STATUS_CODE,
        `urn:oasis:names:tc:SAML:2.0:status:${status.subStatusCode}`,
      );
    }

    if (status.statusMessage) {
      _.set(
        inflatedResponse,
        LightResponseXmlSelectors.STATUS_MESSAGE,
        `${status.statusMessage}`,
      );
    }

    return inflatedResponse;
  }

  private deflateStatus(
    inflatedResponse: IJsonifiedLightResponseXml,
  ): EidasResponseStatus {
    const status: EidasResponseStatus = {
      failure:
        _.get(inflatedResponse, LightResponseXmlSelectors.STATUS_FAILURE) !==
        'false',
    };

    const statusCode = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.STATUS_CODE,
    );
    if (statusCode) {
      status.statusCode = this.lightCommons.getLastElementInUrlOrUrn(
        statusCode,
      );
    }

    const subStatusCode = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.SUB_STATUS_CODE,
    );
    if (subStatusCode) {
      status.subStatusCode = this.lightCommons.getLastElementInUrlOrUrn(
        subStatusCode,
      );
    }

    const statusMessage = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.STATUS_MESSAGE,
    );
    if (statusMessage) {
      status.statusMessage = statusMessage;
    }

    return status;
  }

  private inflateContext(
    inflatedResponse: IJsonifiedLightResponseXml,
    json: EidasResponse,
  ) {
    _.set(inflatedResponse, LightResponseXmlSelectors.ID, json.id);

    _.set(
      inflatedResponse,
      LightResponseXmlSelectors.IN_RESPONSE_TO_ID,
      json.inResponseToId,
    );

    _.set(inflatedResponse, LightResponseXmlSelectors.ISSUER, json.issuer);

    if (json.ipAddress) {
      _.set(
        inflatedResponse,
        LightResponseXmlSelectors.IP_ADDRESS,
        json.ipAddress,
      );
    }

    if (json.relayState) {
      _.set(
        inflatedResponse,
        LightResponseXmlSelectors.RELAY_STATE,
        json.relayState,
      );
    }

    if (!json.status.failure) {
      _.set(
        inflatedResponse,
        LightResponseXmlSelectors.SUBJECT_NAME_ID_FORMAT,
        `urn:oasis:names:tc:SAML:1.1:nameid-format:${json.subjectNameIdFormat}`,
      );

      _.set(inflatedResponse, LightResponseXmlSelectors.SUBJECT, json.subject);

      _.set(
        inflatedResponse,
        LightResponseXmlSelectors.LEVEL_OF_ASSURANCE,
        `http://eidas.europa.eu/LoA/${json.levelOfAssurance}`,
      );
    }

    return inflatedResponse;
  }

  private deflateContext(
    inflatedResponse: IJsonifiedLightResponseXml,
  ): EidasResponseContext {
    const context: EidasResponseContext = {
      id: _.get(inflatedResponse, LightResponseXmlSelectors.ID),
      issuer: _.get(inflatedResponse, LightResponseXmlSelectors.ISSUER),
      subject: _.get(inflatedResponse, LightResponseXmlSelectors.SUBJECT),
      inResponseToId: _.get(
        inflatedResponse,
        LightResponseXmlSelectors.IN_RESPONSE_TO_ID,
      ),
    };

    const levelOfAssurance = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.LEVEL_OF_ASSURANCE,
    );
    if (levelOfAssurance) {
      context.levelOfAssurance = this.lightCommons.getLastElementInUrlOrUrn(
        levelOfAssurance,
      );
    }

    const subjectNameIdFormat = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.SUBJECT_NAME_ID_FORMAT,
    );
    if (subjectNameIdFormat) {
      context.subjectNameIdFormat = this.lightCommons.getLastElementInUrlOrUrn(
        subjectNameIdFormat,
      );
    }

    const relayState = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.RELAY_STATE,
    );
    if (relayState) {
      context.relayState = relayState;
    }

    const ipAddress = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.IP_ADDRESS,
    );
    if (ipAddress) {
      context.ipAddress = ipAddress;
    }

    return context;
  }

  private inflateAttributes(
    inflatedResponse: IJsonifiedLightResponseXml,
    attributes: EidasResponseAttributes,
  ): IJsonifiedLightResponseXml {
    _.set(
      inflatedResponse,
      LightResponseXmlSelectors.ATTRIBUTES,
      Object.entries(attributes).map(this.buildAttribute.bind(this)),
    );

    return inflatedResponse;
  }

  private deflateAttributes(
    inflatedResponse: IJsonifiedLightResponseXml,
  ): EidasResponseAttributes {
    const inflatedAttributes = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.ATTRIBUTES,
    );

    const attributes: EidasResponseAttributes = inflatedAttributes.reduce(
      this.getAttribute.bind(this),
      {},
    );

    return attributes;
  }

  private buildAttribute([key, content]: [string, unknown]) {
    const attribute = {};

    let value;
    if (key === 'currentAddress') {
      value = this.buildAddress(content as EidasResponseAddress);
    } else {
      value = this.buildValues(content as string[]);
    }

    _.set(
      attribute,
      LightResponseXmlSelectors.ATTRIBUTE_DEFINITION,
      `http://eidas.europa.eu/attributes/naturalperson/${_.upperFirst(key)}`,
    );

    _.set(attribute, LightResponseXmlSelectors.ATTRIBUTE_VALUE, value);

    return attribute;
  }

  private getAttribute(
    attributes: object,
    inflatedAttribute: IJsonifiedXml,
  ): object {
    /**
     * We must cast manually to string since lodash has not updated his typescript
     * past 2.8.
     * @see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/25758
     */
    const inflatedKey: string = (_.get(
      inflatedAttribute,
      LightResponseXmlSelectors.ATTRIBUTE_DEFINITION,
    ) as unknown) as string;
    const inflatedValue: IJsonifiedXmlContent = (_.get(
      inflatedAttribute,
      LightResponseXmlSelectors.ATTRIBUTE_VALUE,
    ) as unknown) as IJsonifiedXmlContent;

    /**
     * This extract everything after the last "/"
     * Then set the first letter in lowercase
     */
    const key = _.lowerFirst(
      this.lightCommons.getLastElementInUrlOrUrn(inflatedKey),
    );

    if (key === 'currentAddress') {
      attributes[key] = this.getAddress(inflatedValue);
    } else {
      attributes[key] = this.getValues(
        inflatedValue as IJsonifiedXmlContent | IJsonifiedXmlContent[],
      );
    }

    return attributes;
  }

  private buildAddress(address: EidasResponseAddress): string {
    const builtAddress = Object.entries(address)
      .map(([key, content]: string[]) => {
        const tag = `eidas-natural:${_.upperFirst(key)}`;
        return `<${tag}>${content}</${tag}>`;
      })
      .join('\n');

    return Buffer.from(`${builtAddress}\n`, 'utf8').toString('base64');
  }

  private getAddress({
    _text: inflatedAddress,
  }: IJsonifiedXmlContent): EidasResponseAddress {
    const decodedAddress = Buffer.from(inflatedAddress, 'base64').toString(
      'utf8',
    );

    const addressElementsList = _.compact(decodedAddress.split('\n'));

    return addressElementsList.reduce(
      (
        address: EidasResponseAddress,
        element: string,
      ): EidasResponseAddress => {
        const [match, key, value] =
          /^<eidas-natural:([a-zA-Z]+)>([a-zA-Z0-9\s]+)<\/eidas-natural:[a-zA-Z]+>$/.exec(
            element,
          ) || [];

        if (match) {
          address[_.lowerFirst(key)] = value;
        }

        return address;
      },
      {},
    );
  }

  private buildValues(
    content: string[],
  ): IJsonifiedXmlContent | IJsonifiedXmlContent[] {
    if (content.length > 1) {
      return content.map((value) => ({ _text: value }));
    } else {
      return { _text: content[0] };
    }
  }

  private getValues(
    inflatedContent: IJsonifiedXmlContent | IJsonifiedXmlContent[],
  ): string[] {
    if (inflatedContent instanceof Array) {
      return inflatedContent.map(({ _text }) => _text);
    } else {
      return [inflatedContent._text];
    }
  }
}
