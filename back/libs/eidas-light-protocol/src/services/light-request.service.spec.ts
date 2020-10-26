import * as converter from 'xml-js';
import { Test, TestingModule } from '@nestjs/testing';
import {
  lightRequestJsonMock,
  lightRequestXmlMock,
  requestJsonMock,
} from '../../fixtures';
import {
  EidasJSONConversionException,
  EidasXMLConversionException,
} from '../exceptions';
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

  describe('fromJson', () => {
    it('should call json2xml function from xml2js library', () => {
      // setup
      jest
        .spyOn(converter, 'json2xml')
        .mockReturnValueOnce(lightRequestXmlMock);
      // action
      service.fromJson(requestJsonMock);

      // assertion
      expect(converter.json2xml).toHaveBeenCalledTimes(1);
    });

    it('should convert JSON object to XML document', () => {
      // action
      const result = service.fromJson(requestJsonMock);

      // assertion
      expect(result).toEqual(lightRequestXmlMock);
    });

    it('should throw an error if the library receive something else than a JSON object', () => {
      // setup
      const jsonConversionErrorMessage = 'jsonConversion error';

      jest.spyOn(converter, 'json2xml').mockImplementation(() => {
        throw new Error(jsonConversionErrorMessage);
      });
      // action
      try {
        service.fromJson(requestJsonMock);
      } catch (e) {
        // assertion
        expect(e).toBeInstanceOf(EidasJSONConversionException);
      }

      expect.hasAssertions();
    });
  });

  describe('toJson', () => {
    it('should call xml2json function from xml2js library', () => {
      // setup
      jest
        .spyOn(converter, 'xml2json')
        .mockReturnValueOnce(JSON.stringify(lightRequestJsonMock));
      // action
      service.toJson(lightRequestXmlMock);

      // assertion
      expect(converter.xml2json).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the library receive something else than a string', () => {
      // setup
      const lightRequestXmlMock = 'tryAgainBuddyYoureMistaken';
      const xmlConversionErrorMessage = `Error message`;

      jest.spyOn(converter, 'json2xml').mockImplementation(() => {
        throw new Error(xmlConversionErrorMessage);
      });

      // action
      try {
        service.toJson(lightRequestXmlMock);
      } catch (e) {
        // assertion
        expect(e).toBeInstanceOf(EidasXMLConversionException);
      }

      expect.hasAssertions();
    });
  });

  describe('deflateJson', () => {
    it('should deflate the json', () => {
      // action
      const result = service['deflateJson'](lightRequestJsonMock);

      // assertion
      expect(result).toEqual(requestJsonMock);
    });
  });

  describe('inflateJson', () => {
    it('should inflate the json', () => {
      // action
      const result = service['inflateJson'](requestJsonMock);

      // assertion
      expect(result).toEqual(lightRequestJsonMock);
    });
  });

  describe('getJsonValues', () => {
    it('should send back the value corresponding to the specified path', () => {
      // setup
      const path = 'lightRequest.citizenCountryCode._text';

      // action
      const result = service['getJsonValues'](lightRequestJsonMock, path);

      // assertion
      expect(result).toEqual('BE');
    });

    it('should send back the format of the request', () => {
      // setup
      const path = LightRequestXmlSelectors.NAME_ID_FORMAT;
      const expected = 'unspecified';

      // action
      const result = service['getJsonValues'](lightRequestJsonMock, path);

      // assertion
      expect(result).toEqual(expected);
    });

    it('should send back the attributes of the request', () => {
      // setup
      const path = LightRequestXmlSelectors.REQUESTED_ATTRIBUTES;
      const expected = [
        'PersonIdentifier',
        'CurrentFamilyName',
        'CurrentGivenName',
        'DateOfBirth',
        'CurrentAddress',
        'Gender',
        'BirthName',
        'PlaceOfBirth',
      ];

      // action
      const result = service['getJsonValues'](lightRequestJsonMock, path);

      // assertion
      expect(result).toEqual(expected);
    });
  });
});
