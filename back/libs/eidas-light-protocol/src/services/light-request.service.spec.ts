import * as converter from 'xml-js';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@fc/config';
import {
  lightRequestJsonMock,
  lightRequestXmlMock,
  requestJsonMock,
} from '../../fixtures';
import {
  EidasJsonToXmlException,
  EidasXmlToJsonException,
} from '../exceptions';
import { LightRequestXmlSelectors } from '../enums';
import { LightCommonsService } from './light-commons.service';
import { LightRequestService } from './light-request.service';

describe('LightRequestService', () => {
  let service: LightRequestService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockLightCommonsService = {
    generateToken: jest.fn(),
    parseToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [LightRequestService, ConfigService, LightCommonsService],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .overrideProvider(LightCommonsService)
      .useValue(mockLightCommonsService)
      .compile();

    service = module.get<LightRequestService>(LightRequestService);

    jest.resetAllMocks();
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
        expect(e).toBeInstanceOf(EidasJsonToXmlException);
      }

      expect.hasAssertions();
    });
  });

  describe('generateToken', () => {
    const issuer = 'yeltsA-kciR';
    const id = 'NGGYU';
    const mockConfig = {
      lightRequestConnectorSecret: '?v=dQw4w9WgXcQ',
    };

    beforeEach(() => {
      mockConfigService.get.mockReturnValueOnce(mockConfig);
    });

    it('should get the lightRequestConnectorSecret from the config', () => {
      // setup
      const expectedConfigName = 'EidasLightProtocol';

      // action
      service.generateToken(id, issuer);

      // expect
      expect(mockConfigService.get).toHaveBeenCalledTimes(1);
      expect(mockConfigService.get).toHaveBeenCalledWith(expectedConfigName);
    });

    it('should call LightCommons.generateToken with the id, the issuer and the lightRequestConnectorSecret', () => {
      // setup
      const expectedDate = undefined;

      // action
      service.generateToken(id, issuer);

      // expect
      expect(mockLightCommonsService.generateToken).toHaveBeenCalledTimes(1);
      expect(mockLightCommonsService.generateToken).toHaveBeenCalledWith(
        id,
        issuer,
        mockConfig.lightRequestConnectorSecret,
        expectedDate,
      );
    });

    it('should call LightCommons.generateToken with a specific date if the date argument is set', () => {
      // setup
      const expectedDate = new Date(Date.UTC(2012, 6, 4));

      // action
      service.generateToken(id, issuer, expectedDate);

      // expect
      expect(mockLightCommonsService.generateToken).toHaveBeenCalledTimes(1);
      expect(mockLightCommonsService.generateToken).toHaveBeenCalledWith(
        id,
        issuer,
        mockConfig.lightRequestConnectorSecret,
        expectedDate,
      );
    });

    it('should return the result of LightCommons.generateToken call', () => {
      // setup
      /**
       * This is the expected token for the data described in the beforeEach section
       */
      const expected =
        'eWVsdHNBLWtjaVJ8TkdHWVV8MTk2OS0wNy0yMSAxNzo1NDowMCAwMDB8eFR6aUwyWVZ2U09SYUVEUFBiZFNwOVZvR3k3OEJ4bjNhY3pVcGhnWFozdz0=';
      mockLightCommonsService.generateToken.mockReturnValueOnce(expected);

      // action
      const result = service.generateToken(id, issuer);

      // expect
      expect(result).toStrictEqual(expected);
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
        expect(e).toBeInstanceOf(EidasXmlToJsonException);
      }

      expect.hasAssertions();
    });
  });

  describe('parseToken', () => {
    const mockConfig = {
      lightRequestProxyServiceSecret: '?v=dQw4w9WgXcQ',
    };
    const token = 'avc';

    beforeEach(() => {
      mockConfigService.get.mockReturnValueOnce(mockConfig);
    });

    it('should get the lightRequestProxyServiceSecret from the config', () => {
      // setup
      const expectedConfigName = 'EidasLightProtocol';

      // action
      service.parseToken(token);

      // expect
      expect(mockConfigService.get).toHaveBeenCalledTimes(1);
      expect(mockConfigService.get).toHaveBeenCalledWith(expectedConfigName);
    });

    it('should call parseToken from the light commons service with the token and the lightRequestProxyServiceSecret', () => {
      // action
      service.parseToken(token);

      // expect
      expect(mockLightCommonsService.parseToken).toHaveBeenCalledTimes(1);
      expect(mockLightCommonsService.parseToken).toHaveBeenCalledWith(
        token,
        mockConfig.lightRequestProxyServiceSecret,
      );
    });

    it('should return the parsed token', () => {
      // setup
      const parsedToken = {
        id: 'id',
        issuer: 'issuer',
        date: new Date(),
      };
      mockLightCommonsService.parseToken.mockReturnValueOnce(parsedToken);

      // action
      const result = service.parseToken(token);

      // expect
      expect(result).toStrictEqual(parsedToken);
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
