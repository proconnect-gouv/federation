import { json2xml, xml2json } from 'xml-js';
import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { EidasJSONConversionException, EidasXMLConversionException } from '../exceptions';
import { LightRequestXmlSelectors } from '../enums';
import { IJsonifiedXml } from '../interfaces'

@Injectable()
export class LightRequestService {
    fromJSON(jsonData, id): string {
        try {
            jsonData['lightRequest']['id'] = id;
            const options = { compact: true, ignoreComment: true, spaces: 2 };
            return json2xml(JSON.stringify(jsonData), options);
        } catch (error) {
            throw new EidasJSONConversionException(error);
        }
    }

    toJSON(xmlDoc: string): IJsonifiedXml {
        try {
            const options = { compact: true, spaces: 2 };
            return this.flattenJSON(JSON.parse(xml2json(xmlDoc, options)));
        } catch (error) {
            throw new EidasXMLConversionException(error);
        }
    }

    private flattenJSON(json): IJsonifiedXml {
        const newJson: IJsonifiedXml = {
            citizenCountryCode: this.getJSONValues(json, LightRequestXmlSelectors.COUNTRY),
            id: this.getJSONValues(json, LightRequestXmlSelectors.ID ),
            issuer: this.getJSONValues(json, LightRequestXmlSelectors.ISSUER ),
            levelOfAssurance: this.getJSONValues(json, LightRequestXmlSelectors.LEVEL_OF_ASSURANCE),
            nameIdFormat: this.getJSONValues(json, LightRequestXmlSelectors.NAME_ID_FORMAT),
            providerName: this.getJSONValues(json, LightRequestXmlSelectors.PROVIDER_NAME),
            spType: this.getJSONValues(json, LightRequestXmlSelectors.SERVICE_PROVIDER_TYPE),
            relayState: this.getJSONValues(json, LightRequestXmlSelectors.RELAY_STATE),
            requestedAttributes: this.getJSONValues(json, LightRequestXmlSelectors.REQUESTED_ATTRIBUTES),
        }

        return newJson;
    }

    /**
     * @TODO split cette fonction
     */
    private getJSONValues(json, path) {
        let final;
        const value = _.get(json, path)

        if (path === LightRequestXmlSelectors.NAME_ID_FORMAT) {
          final = value.split('format: ')[1]
        } else if (path === LightRequestXmlSelectors.REQUESTED_ATTRIBUTES) {
          final = [];
          value.map(attribute => {
            final.push( /[^/]*$/.exec(attribute.definition._text)[0]);
          });
        } else  {
          final = value;
        }
        return final;
    }
}
