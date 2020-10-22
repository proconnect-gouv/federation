import * as converter from 'xml-js';
import { Test, TestingModule } from '@nestjs/testing';
import { lightRequestJsonMock, lightRequestXmlMock } from '../../fixtures';
import { EidasJSONConversionException,  EidasXMLConversionException } from '../exceptions';
import { LightRequestXmlSelectors } from '../enums';
import { LightRequestService } from './light-request.service';


describe('LightRequestService', () => {
  let service: LightRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LightRequestService],
    }).compile();

    service = module.get<LightRequestService>(LightRequestService);
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fromJSON', () => {
    const id = 'Auduye7263';

    it('should call json2xml function from xml2js library', () => {
      // setup
      jest.spyOn(converter, 'json2xml').mockReturnValueOnce(lightRequestXmlMock);
      // action
      service.fromJSON(lightRequestJsonMock, id);

      // assertion
      expect(converter.json2xml).toHaveBeenCalledTimes(1);
    });

    it('should convert JSON object to XML document', () => {
      // action
      const result = service.fromJSON(lightRequestJsonMock, id);

      // assertion
      expect(result).toEqual(lightRequestXmlMock);
    });

    it('should throw an error if the library receive something else than a JSON object', () => {
      // setup
      const lightRequestJsonMock = 'tryAgainBuddyYoureMistaken';

      const jsonConversionErrorMessage = 'jsonConversion error';

      jest
        .spyOn(converter, 'json2xml')
        .mockImplementation(() => {
          throw new Error(jsonConversionErrorMessage);
        });
      // action
      try {
        service.fromJSON(lightRequestJsonMock, id);
      } catch (e) {
        // assertion
        expect(e).toBeInstanceOf(EidasJSONConversionException);
      }

      expect.hasAssertions()
    });
  });

  describe('toJSON', () => {

    it('should call xml2json function from xml2js library', () => {
      // setup
      jest.spyOn(converter, 'xml2json').mockReturnValueOnce(JSON.stringify(lightRequestJsonMock));
      // action
      service.toJSON(lightRequestXmlMock);

      // assertion
      expect(converter.xml2json).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the library receive something else than a string', () => {
      // setup
      const lightRequestXmlMock = 'tryAgainBuddyYoureMistaken';
      const xmlConversionErrorMessage = `Error message`;

      jest
        .spyOn(converter, 'json2xml')
        .mockImplementation(() => {
          throw new Error(xmlConversionErrorMessage);
        });

      // action
      try {
        service.toJSON(lightRequestXmlMock);
      } catch (e) {
        // assertion
        expect(e).toBeInstanceOf(EidasXMLConversionException);
      }

      expect.hasAssertions()
    });
  });

  describe('flattenJSON', () => {
    const lightRequestJsonMockFlatten = {
      "_declaration": {
        "_attributes": {
          "version": "1.0",
          "encoding": "UTF-8",
          "standalone": "yes"
        }
      },
      "lightRequest": {
        "citizenCountryCode": {
          "_text": "BE"
        },
        "id": {
          "_text": "Auduye7263"
        },
        "issuer": {
          "_text": "EIDASBridge"
        },
        "levelOfAssurance": {
          "_text": "http://eidas.europa.eu/LoA/low"
        },
        "nameIdFormat": {
          "_text": "urn: oasis: names: tc: SAML: 1.1: nameid - format: unspecified"
        },
        "providerName": {
          "_text": "FranceConnect"
        },
        "spType": {
          "_text": "public"
        },
        "relayState": {
          "_text": "myState"
        },
        "requestedAttributes": {
          "attribute": [
            {
              "definition": {
                "_text": "http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier"
              }
            },
            {
              "definition": {
                "_text": "http://eidas.europa.eu/attributes/naturalperson/CurrentFamilyName"
              }
            },
            {
              "definition": {
                "_text": "http://eidas.europa.eu/attributes/naturalperson/CurrentGivenName"
              }
            },
            {
              "definition": {
                "_text": "http://eidas.europa.eu/attributes/naturalperson/DateOfBirth"
              }
            }
          ]
        }
      }
    };

    it('should call getJSONValues', () => {
      // setup
      const expected = {
          "citizenCountryCode": "BE",
          "id": "Auduye7263",
          "issuer": "EIDASBridge",
          "levelOfAssurance":  "http://eidas.europa.eu/LoA/low",
          "nameIdFormat": "unspecified",
          "providerName":  "FranceConnect",
          "spType": "public",
          "relayState": "myState",
          "requestedAttributes": ["PersonIdentifier","CurrentFamilyName","CurrentGivenName", "DateOfBirth"],
      }
      // action
      const result = service['flattenJSON'](lightRequestJsonMockFlatten);

      // assertion
      // tslint:disable-next-line: no-string-literal
      expect(result).toEqual(expected);
    })
  });

  describe('getJSONValues', () => {
    it('should send back the value corresponding to the specified path', () => {
      // setup 
      const path = 'lightRequest.citizenCountryCode._text';

      // action
      const result = service['getJSONValues'](lightRequestJsonMock, path)

      // assertion
      expect(result).toEqual("BE");
    });

    it('should send back the format of the request', () => {
      // setup 
      const path = LightRequestXmlSelectors.NAME_ID_FORMAT;
      const expected = 'unspecified';

      // action
      const result = service['getJSONValues'](lightRequestJsonMock, path)

      // assertion
      expect(result).toEqual(expected);
    });

    it('should send back the attributes of the request', () => {
      // setup 
      const path = LightRequestXmlSelectors.REQUESTED_ATTRIBUTES;
      const expected = ['PersonIdentifier', 'CurrentFamilyName', 'CurrentGivenName', 'DateOfBirth'];

      // action
      const result = service['getJSONValues'](lightRequestJsonMock, path)

      // assertion
      expect(result).toEqual(expected);
    });
  })
});
