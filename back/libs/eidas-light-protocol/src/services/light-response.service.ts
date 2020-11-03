import * as _ from 'lodash';
import { json2xml, xml2json } from 'xml-js';
import { Injectable } from '@nestjs/common';
import { LightResponseXmlSelectors } from '../enums';
import {
  IResponse,
  IResponseStatus,
  IResponseAddress,
  IResponseAttributes,
  IJsonifiedLightResponseXml,
  IJsonifiedXmlContent,
  IResponseContext,
  IJsonifiedXml,
} from '../interfaces';
import {
  EidasJSONConversionException,
  EidasXMLConversionException,
} from '../exceptions';

/**
 * @todo This file is too big and need to be splitted in the future between
 * generics functions and business functions.
 */
@Injectable()
export class LightResponseService {
  /**
   * Convert light response from JSON to XML
   * @param {IResponse} jsonData
   */
  fromJson(jsonData: IResponse): string {
    try {
      const options = { compact: true, ignoreComment: true, spaces: 2 };

      const inflatedJson = this.inflateJson(jsonData);
      const stringifiedJson = JSON.stringify(inflatedJson);

      return json2xml(stringifiedJson, options);
    } catch (error) {
      throw new EidasJSONConversionException(error);
    }
  }

  /**
   * Convert light response XML to JSON
   * @param {string} xmlDoc
   */
  toJson(xmlDoc: string): IResponse {
    try {
      const options = { compact: true, spaces: 2 };

      const stringifiedJson = xml2json(xmlDoc, options);
      const inflatedJson = JSON.parse(stringifiedJson);

      return this.deflateJson(inflatedJson);
    } catch (error) {
      throw new EidasXMLConversionException(error);
    }
  }

  private inflateJson(json: IResponse): IJsonifiedLightResponseXml {
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

    if (json.status.failure === 'false') {
      this.inflateAttributes(inflatedJson, json.attributes);
    }

    return inflatedJson;
  }

  private deflateJson(inflatedJson: IJsonifiedLightResponseXml): IResponse {
    const deflatedJson: IResponse = {
      ...this.deflateContext(inflatedJson),
      status: this.deflateStatus(inflatedJson),
    };

    if (deflatedJson.status.failure === 'false') {
      deflatedJson.attributes = this.deflateAttributes(inflatedJson);
    }

    return deflatedJson;
  }

  private inflateStatus(
    inflatedResponse: IJsonifiedLightResponseXml,
    status: IResponseStatus,
  ): IJsonifiedLightResponseXml {
    _.set(
      inflatedResponse,
      LightResponseXmlSelectors.STATUS_FAILURE,
      `urn:oasis:names:tc:SAML:2.0:status:${status.failure}`,
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
  ): IResponseStatus {
    const status: IResponseStatus = {
      failure: _.get(
        inflatedResponse,
        LightResponseXmlSelectors.STATUS_FAILURE,
      ),
    };

    const statusCode = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.STATUS_CODE,
    );
    if (statusCode) {
      status.statusCode = this.getLastElementInUrlOrUrn(
        statusCode,
      ) as StatusCode;
    }

    const subStatusCode = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.SUB_STATUS_CODE,
    );
    if (subStatusCode) {
      status.subStatusCode = this.getLastElementInUrlOrUrn(
        subStatusCode,
      ) as SubStatusCode;
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
    json: IResponse,
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

    return inflatedResponse;
  }

  private deflateContext(
    inflatedResponse: IJsonifiedLightResponseXml,
  ): IResponseContext {
    const subjectNameIdFormat = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.SUBJECT_NAME_ID_FORMAT,
    );
    const levelOfAssurance = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.LEVEL_OF_ASSURANCE,
    );

    const context: IResponseContext = {
      id: _.get(inflatedResponse, LightResponseXmlSelectors.ID),
      issuer: _.get(inflatedResponse, LightResponseXmlSelectors.ISSUER),
      subject: _.get(inflatedResponse, LightResponseXmlSelectors.SUBJECT),
      subjectNameIdFormat: this.getLastElementInUrlOrUrn(
        subjectNameIdFormat,
      ) as SubjectNameIdFormat,
      inResponseToId: _.get(
        inflatedResponse,
        LightResponseXmlSelectors.IN_RESPONSE_TO_ID,
      ),
      levelOfAssurance: this.getLastElementInUrlOrUrn(
        levelOfAssurance,
      ) as LevelOfAssurance,
    };

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
    attributes: IResponseAttributes,
  ): IJsonifiedLightResponseXml {
    _.set(
      inflatedResponse,
      LightResponseXmlSelectors.ATTRIBUTES,
      Object.entries(attributes).map(this.buildAttribute),
    );

    return inflatedResponse;
  }

  private deflateAttributes(
    inflatedResponse: IJsonifiedLightResponseXml,
  ): IResponseAttributes {
    const inflatedAttributes = _.get(
      inflatedResponse,
      LightResponseXmlSelectors.ATTRIBUTES,
    );

    const attributes: IResponseAttributes = inflatedAttributes.reduce(
      this.getAttribute,
      {},
    );

    return attributes;
  }

  private buildAttribute([key, content]: [string, unknown]) {
    const attribute = {};

    let value;
    if (key === 'currentAddress') {
      value = this.buildAddress(content as IResponseAddress);
    } else {
      value = this.buildValues(content as string | string[]);
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
    const inflatedValue: unknown = _.get(
      inflatedAttribute,
      LightResponseXmlSelectors.ATTRIBUTE_VALUE,
    );

    /**
     * This extract everything after the last "/"
     * Then set the first letter in lowercase
     */
    const key = _.lowerFirst(this.getLastElementInUrlOrUrn(inflatedKey));

    if (key === 'currentAddress') {
      attributes[key] = this.getAddress(inflatedValue as string);
    } else {
      attributes[key] = this.getValues(
        inflatedValue as IJsonifiedXmlContent | IJsonifiedXmlContent[],
      );
    }

    return attributes;
  }

  private buildAddress(address: IResponseAddress) {
    return Buffer.from(
      `<eidas-natural:fullCvaddress>${address.fullCvaddress}</eidas-natural:fullCvaddress>`,
      'utf8',
    ).toString('base64');
  }

  private getAddress(inflatedAddress: string): IResponseAddress {
    const decodedAddress = Buffer.from(inflatedAddress, 'base64').toString(
      'utf8',
    );

    const addressElementsList = _.compact(decodedAddress.split('\n'));

    return addressElementsList.reduce(
      (address: IResponseAddress, element: string): IResponseAddress => {
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
    content: string | string[],
  ): IJsonifiedXmlContent | IJsonifiedXmlContent[] {
    if (content instanceof Array) {
      return content.map((value) => ({ _text: value }));
    } else {
      return { _text: content };
    }
  }

  private getValues(
    inflatedContent: IJsonifiedXmlContent | IJsonifiedXmlContent[],
  ): string | string[] {
    if (inflatedContent instanceof Array) {
      return inflatedContent.map(({ _text }) => _text);
    } else {
      return inflatedContent._text;
    }
  }

  private getLastElementInUrlOrUrn(value: string): string {
    return value.split(/[:/]/).pop();
  }
}
