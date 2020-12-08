import * as xmlJs from 'xml-js';
import * as _ from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { EidasResponseAttributes } from '@fc/eidas';
import {
  successFullJsonMock,
  lightResponseSuccessFullJsonMock,
  lightResponseSuccessFullXmlMock,
  successMandatoryJsonMock,
  lightResponseSuccessMandatoryJsonMock,
  failureFullJsonMock,
  lightResponseFailureFullJsonMock,
} from '../../fixtures';
import {
  EidasJsonToXmlException,
  EidasXmlToJsonException,
} from '../exceptions';
import { IJsonifiedLightResponseXml, IJsonifiedXml } from '../interfaces';
import { LightResponseXmlSelectors } from '../enums';
import { LightResponseService } from './light-response.service';
import { LightCommonsService } from './light-commons.service';

describe('LightResponseService', () => {
  let service: LightResponseService;

  const configServiceMock = {
    get: jest.fn(),
  };

  const lightCommonsServiceMock = {
    generateToken: jest.fn(),
    parseToken: jest.fn(),
    getLastElementInUrlOrUrn: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LightResponseService, ConfigService, LightCommonsService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LightCommonsService)
      .useValue(lightCommonsServiceMock)
      .compile();

    service = module.get<LightResponseService>(LightResponseService);

    lightCommonsServiceMock.getLastElementInUrlOrUrn.mockImplementation(
      LightCommonsService.prototype.getLastElementInUrlOrUrn,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fromJson', () => {
    beforeEach(() => {
      service['inflateJson'] = jest
        .fn()
        .mockReturnValueOnce(lightResponseSuccessFullJsonMock);
      jest
        .spyOn(xmlJs, 'json2xml')
        .mockReturnValueOnce(lightResponseSuccessFullXmlMock);
    });

    it('should call inflateJson with the given json', () => {
      // action
      service.fromJson(successFullJsonMock);

      // expect
      expect(service['inflateJson']).toHaveBeenCalledTimes(1);
      expect(service['inflateJson']).toHaveBeenCalledWith(successFullJsonMock);
    });

    it('should call json2xml from xml-js library with a stringified json and json2xml options', () => {
      // setup
      const expectedJson2xmlOptions = {
        compact: true,
        ignoreComment: true,
        spaces: 2,
      };

      // action
      service.fromJson(successFullJsonMock);

      // expect
      expect(xmlJs.json2xml).toHaveBeenCalledTimes(1);
      expect(xmlJs.json2xml).toHaveBeenCalledWith(
        JSON.stringify(lightResponseSuccessFullJsonMock),
        expectedJson2xmlOptions,
      );
    });

    it('should return the XML doc', () => {
      // action
      const result = service.fromJson(successFullJsonMock);

      // expect
      expect(result).toStrictEqual(lightResponseSuccessFullXmlMock);
    });

    it('should throw an EidasJsonToXmlException exception if one of the calls throws', () => {
      // setup
      const errorToThrow = new Error('Nani ?');
      const expectedError = new EidasJsonToXmlException(errorToThrow);
      jest.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
        throw errorToThrow;
      });

      try {
        // action
        service.fromJson(successFullJsonMock);
      } catch (e) {
        // expect
        expect(e).toBeInstanceOf(EidasJsonToXmlException);
        expect(e.message).toStrictEqual(expectedError.message);
      }

      // expect
      expect.hasAssertions();
    });
  });

  describe('generateToken', () => {
    const lightResponseProxyServiceSecret = 'lightResponseProxyServiceSecret';
    const id = 'id';
    const issuer = 'issuer';

    beforeEach(() => {
      configServiceMock.get.mockReturnValueOnce({
        lightResponseProxyServiceSecret,
      });
    });

    it('should get the lightResponseProxyServiceSecret from the config', () => {
      // action
      service.generateToken(id, issuer);

      // expect
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('EidasLightProtocol');
    });

    it('should call the light commons service with the given id and issuer, and the lightResponseProxyServiceSecret', () => {
      // action
      service.generateToken(id, issuer);

      // expect
      expect(lightCommonsServiceMock.generateToken).toHaveBeenCalledTimes(1);
      expect(lightCommonsServiceMock.generateToken).toHaveBeenCalledWith(
        id,
        issuer,
        lightResponseProxyServiceSecret,
        undefined,
      );
    });

    it('should call the light commons service with the given id, issuer and date, and the lightResponseProxyServiceSecret', () => {
      // setup
      const date = new Date('1992-4-23');

      // action
      service.generateToken(id, issuer, date);

      // expect
      expect(lightCommonsServiceMock.generateToken).toHaveBeenCalledTimes(1);
      expect(lightCommonsServiceMock.generateToken).toHaveBeenCalledWith(
        id,
        issuer,
        lightResponseProxyServiceSecret,
        date,
      );
    });
  });

  describe('toJson', () => {
    beforeEach(() => {
      jest
        .spyOn(xmlJs, 'xml2json')
        .mockReturnValueOnce(JSON.stringify(lightResponseSuccessFullJsonMock));
      service['deflateJson'] = jest
        .fn()
        .mockReturnValueOnce(successFullJsonMock);
    });

    it('should call xml2json from xml-js library with the XML doc and xml2json options', () => {
      // setup
      const expectedXml2JsonOptions = {
        compact: true,
        spaces: 2,
      };

      // action
      service.toJson(lightResponseSuccessFullXmlMock);

      // expect
      expect(xmlJs.xml2json).toHaveBeenCalledTimes(1);
      expect(xmlJs.xml2json).toHaveBeenCalledWith(
        lightResponseSuccessFullXmlMock,
        expectedXml2JsonOptions,
      );
    });

    it('should call deflateJson with the given inflated json', () => {
      // action
      service.toJson(lightResponseSuccessFullXmlMock);

      // expect
      expect(service['deflateJson']).toHaveBeenCalledTimes(1);
      expect(service['deflateJson']).toHaveBeenCalledWith(
        lightResponseSuccessFullJsonMock,
      );
    });

    it('should return the deflated json', () => {
      // action
      const result = service.toJson(lightResponseSuccessFullXmlMock);

      // expect
      expect(result).toStrictEqual(successFullJsonMock);
    });

    it('should throw an EidasXmlToJsonException exception if one of the calls throws', () => {
      // setup
      const errorToThrow = new Error('Nani ?');
      const expectedError = new EidasXmlToJsonException(errorToThrow);
      jest.spyOn(JSON, 'parse').mockImplementationOnce(() => {
        throw errorToThrow;
      });

      try {
        // action
        service.toJson(lightResponseSuccessFullXmlMock);
      } catch (e) {
        // expect
        expect(e).toBeInstanceOf(EidasXmlToJsonException);
        expect(e.message).toStrictEqual(expectedError.message);
      }

      // expect
      expect.hasAssertions();
    });
  });

  describe('parseToken', () => {
    const lightResponseConnectorSecret = 'lightResponseConnectorSecret';
    const token =
      'SGV5LCBzZXJpb3VzbHksIGRpZCB5b3UgcmVhbGx5IGV4cGVjdCB0byBmaW5kIHNtZXRoaW5nIGhlcmUgOkQgPw==';

    beforeEach(() => {
      configServiceMock.get.mockReturnValueOnce({
        lightResponseConnectorSecret,
      });
    });

    it('should get the lightResponseConnectorSecret from the config', () => {
      // action
      service.parseToken(token);

      // expect
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('EidasLightProtocol');
    });

    it('should call the light commons service with the given token, and the lightResponseConnectorSecret', () => {
      // action
      service.parseToken(token);

      // expect
      expect(lightCommonsServiceMock.parseToken).toHaveBeenCalledTimes(1);
      expect(lightCommonsServiceMock.parseToken).toHaveBeenCalledWith(
        token,
        lightResponseConnectorSecret,
      );
    });
  });

  describe('inflateJson', () => {
    let inflatedJson: IJsonifiedLightResponseXml;

    beforeEach(() => {
      service['inflateContext'] = jest.fn();
      service['inflateStatus'] = jest.fn();
      service['inflateAttributes'] = jest.fn();

      inflatedJson = {
        _declaration: {
          _attributes: {
            version: '1.0',
            encoding: 'UTF-8',
            standalone: 'yes',
          },
        },
        lightResponse: {},
      };
    });

    it('should call inflateContext with the json being inflated and the json to inflate', () => {
      // action
      service['inflateJson'](successFullJsonMock);

      // expect
      expect(service['inflateContext']).toHaveBeenCalledTimes(1);
      expect(service['inflateContext']).toHaveBeenCalledWith(
        inflatedJson,
        successFullJsonMock,
      );
    });

    it('should call inflateStatus with the json being inflated and the status object from the json to inflate', () => {
      // action
      service['inflateJson'](successFullJsonMock);

      // expect
      expect(service['inflateStatus']).toHaveBeenCalledTimes(1);
      expect(service['inflateStatus']).toHaveBeenCalledWith(
        inflatedJson,
        successFullJsonMock.status,
      );
    });

    it('shoud call inflateAttributes if the failure property of the json to inflate is false', () => {
      // action
      service['inflateJson'](successFullJsonMock);

      // expect
      expect(service['inflateAttributes']).toHaveBeenCalledTimes(1);
      expect(service['inflateAttributes']).toHaveBeenCalledWith(
        inflatedJson,
        successFullJsonMock.attributes,
      );
    });

    it('shoud not call inflateAttributes if the failure property of the json to inflate is true', () => {
      // action
      service['inflateJson'](failureFullJsonMock);

      // expect
      expect(service['inflateAttributes']).toHaveBeenCalledTimes(0);
    });

    it('should return the inflatedJson', () => {
      // action
      const result = service['inflateJson'](successFullJsonMock);

      // expect
      expect(result).toStrictEqual(inflatedJson);
    });
  });

  describe('deflateJson', () => {
    const mockDeflateContext = jest.fn();
    const mockDeflateStatus = jest.fn();
    const mockDeflateAttributes = jest.fn();

    beforeEach(() => {
      service['deflateContext'] = mockDeflateContext;
      service['deflateStatus'] = mockDeflateStatus;
      service['deflateAttributes'] = mockDeflateAttributes;
    });

    it('should call deflateContext with the inflatedJson', () => {
      // setup
      mockDeflateStatus.mockReturnValueOnce(successFullJsonMock.status);

      // action
      service['deflateJson'](lightResponseSuccessFullJsonMock);

      // expect
      expect(service['deflateContext']).toHaveBeenCalledTimes(1);
      expect(service['deflateContext']).toHaveBeenCalledWith(
        lightResponseSuccessFullJsonMock,
      );
    });

    it('should call deflateStatus with the inflatedJson', () => {
      // setup
      mockDeflateStatus.mockReturnValueOnce(successFullJsonMock.status);

      // action
      service['deflateJson'](lightResponseSuccessFullJsonMock);

      // expect
      expect(service['deflateStatus']).toHaveBeenCalledTimes(1);
      expect(service['deflateStatus']).toHaveBeenCalledWith(
        lightResponseSuccessFullJsonMock,
      );
    });

    it('shoud call deflateAttributes if the failure property of the json to deflate is false', () => {
      // setup
      mockDeflateStatus.mockReturnValueOnce(successFullJsonMock.status);

      // action
      service['deflateJson'](lightResponseSuccessFullJsonMock);

      // expect
      expect(service['deflateAttributes']).toHaveBeenCalledTimes(1);
      expect(service['deflateAttributes']).toHaveBeenCalledWith(
        lightResponseSuccessFullJsonMock,
      );
    });

    it('shoud not call deflateAttributes if the failure property of the json to deflate is true', () => {
      // setup
      mockDeflateStatus.mockReturnValueOnce(failureFullJsonMock.status);

      // action
      service['deflateJson'](lightResponseFailureFullJsonMock);

      // expect
      expect(service['deflateAttributes']).toHaveBeenCalledTimes(0);
    });

    it('should return the deflatedJson', () => {
      // setup
      mockDeflateContext.mockReturnValueOnce({ id: 42 });
      mockDeflateStatus.mockReturnValueOnce({ failure: false });
      mockDeflateAttributes.mockReturnValueOnce({
        currentFamilyName: ['Norris'],
      });

      const expectedDeflatedJson = {
        id: 42,
        status: {
          failure: false,
        },
        attributes: {
          currentFamilyName: ['Norris'],
        },
      };

      // action
      const result = service['deflateJson'](lightResponseSuccessFullJsonMock);

      // expect
      expect(result).toStrictEqual(expectedDeflatedJson);
    });
  });

  describe('inflateStatus', () => {
    let inflatedJson: IJsonifiedLightResponseXml;

    beforeEach(() => {
      jest.spyOn(_, 'set');

      inflatedJson = {
        _declaration: {
          _attributes: {
            version: '1.0',
            encoding: 'UTF-8',
            standalone: 'yes',
          },
        },
        lightResponse: {},
      };
    });

    it('should call "_.set" with json being inflated, the status failure, the corresponding xml selector and failure status', () => {
      // action
      service['inflateStatus'](inflatedJson, successFullJsonMock.status);

      // expect
      expect(_.set).toHaveBeenCalledTimes(3);
      expect(_.set).toHaveBeenNthCalledWith(
        1,
        inflatedJson,
        LightResponseXmlSelectors.STATUS_FAILURE,
        `${successFullJsonMock.status.failure}`,
      );
    });

    it('should call "_.set" with json being inflated, the status code, the corresponding xml selector and status code', () => {
      // action
      service['inflateStatus'](inflatedJson, successFullJsonMock.status);

      // expect
      expect(_.set).toHaveBeenCalledTimes(3);
      expect(_.set).toHaveBeenNthCalledWith(
        2,
        inflatedJson,
        LightResponseXmlSelectors.STATUS_CODE,
        `urn:oasis:names:tc:SAML:2.0:status:${successFullJsonMock.status.statusCode}`,
      );
    });

    it('should call "_.set" with json being inflated, the sub status code, the corresponding xml selector and sub status code', () => {
      // action
      service['inflateStatus'](inflatedJson, failureFullJsonMock.status);

      // expect
      expect(_.set).toHaveBeenCalledTimes(4);
      expect(_.set).toHaveBeenNthCalledWith(
        3,
        inflatedJson,
        LightResponseXmlSelectors.SUB_STATUS_CODE,
        `urn:oasis:names:tc:SAML:2.0:status:${failureFullJsonMock.status.subStatusCode}`,
      );
    });

    it('should call "_.set" with json being inflated, the status message, the corresponding xml selector and status message', () => {
      // action
      service['inflateStatus'](inflatedJson, failureFullJsonMock.status);

      // expect
      expect(_.set).toHaveBeenCalledTimes(4);
      expect(_.set).toHaveBeenNthCalledWith(
        4,
        inflatedJson,
        LightResponseXmlSelectors.STATUS_MESSAGE,
        failureFullJsonMock.status.statusMessage,
      );
    });

    it('should not call "_.set" with status code if the status code does not exist', () => {
      // action
      service['inflateStatus'](inflatedJson, successMandatoryJsonMock.status);

      // expect
      expect(_.set).not.toHaveBeenCalledWith(
        inflatedJson,
        LightResponseXmlSelectors.STATUS_CODE,
        `urn:oasis:names:tc:SAML:2.0:status:${successMandatoryJsonMock.status.statusCode}`,
      );
    });

    it('should not call "_.set" with sub status code if the sub status code does not exist', () => {
      // action
      service['inflateStatus'](inflatedJson, successMandatoryJsonMock.status);

      // expect
      expect(_.set).not.toHaveBeenCalledWith(
        inflatedJson,
        LightResponseXmlSelectors.SUB_STATUS_CODE,
        `urn:oasis:names:tc:SAML:2.0:status:${successMandatoryJsonMock.status.subStatusCode}`,
      );
    });

    it('should not call "_.set" with status message if the status message does not exist', () => {
      // action
      service['inflateStatus'](inflatedJson, successMandatoryJsonMock.status);

      // expect
      expect(_.set).not.toHaveBeenCalledWith(
        inflatedJson,
        LightResponseXmlSelectors.STATUS_MESSAGE,
        successMandatoryJsonMock.status.statusMessage,
      );
    });

    it('should return the inflated response with the status', () => {
      const expectedInflatedJson = {
        _declaration: {
          _attributes: { encoding: 'UTF-8', standalone: 'yes', version: '1.0' },
        },
        lightResponse: {
          status: {
            failure: { _text: 'false' },
            statusCode: { _text: 'urn:oasis:names:tc:SAML:2.0:status:Success' },
            statusMessage: { _text: 'myMessage' },
          },
        },
      };

      // action
      service['inflateStatus'](inflatedJson, successFullJsonMock.status);

      // expect
      expect(inflatedJson).toStrictEqual(expectedInflatedJson);
    });
  });

  describe('deflateStatus', () => {
    beforeEach(() => {
      jest.spyOn(_, 'get');
    });

    it('should call "_.get" with the inflated response and the status failure xml selector ', () => {
      // action
      service['deflateStatus'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(4);
      expect(_.get).toHaveBeenNthCalledWith(
        1,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.STATUS_FAILURE,
      );
    });

    it('should call "_.get" with the inflated response and the status code xml selector', () => {
      // action
      service['deflateStatus'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(4);
      expect(_.get).toHaveBeenNthCalledWith(
        2,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.STATUS_CODE,
      );
    });

    it('should call "_.get" with the inflated response and the sub status code xml selector ', () => {
      // action
      service['deflateStatus'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(4);
      expect(_.get).toHaveBeenNthCalledWith(
        3,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.SUB_STATUS_CODE,
      );
    });

    it('should call "_.get" with the inflated response and the status message xml selector', () => {
      // action
      service['deflateStatus'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(4);
      expect(_.get).toHaveBeenNthCalledWith(
        4,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.STATUS_MESSAGE,
      );
    });

    it('should not set the status code of the deflated json if "_.get" could not retrieve a status code from the inflated response', () => {
      // action
      const result = service['deflateStatus'](
        lightResponseSuccessMandatoryJsonMock,
      );

      // expect
      expect(result.statusCode).not.toBeDefined();
    });

    it('should not set the sub status code of the deflated json if "_.get" could not retrieve a sub status code from the inflated response', () => {
      // action
      const result = service['deflateStatus'](
        lightResponseSuccessMandatoryJsonMock,
      );

      // expect
      expect(result.subStatusCode).not.toBeDefined();
    });

    it('should not set the status message of the deflated json if "_.get" could not retrieve a status message from the inflated response', () => {
      // action
      const result = service['deflateStatus'](
        lightResponseSuccessMandatoryJsonMock,
      );

      // expect
      expect(result.statusMessage).not.toBeDefined();
    });

    it('should return the status objet of the deflated json', () => {
      // action
      const result = service['deflateStatus'](lightResponseFailureFullJsonMock);

      // expect
      expect(result).toStrictEqual(failureFullJsonMock.status);
    });
  });

  describe('inflateContext', () => {
    let inflatedJson: IJsonifiedLightResponseXml;

    beforeEach(() => {
      jest.spyOn(_, 'set');

      inflatedJson = {
        _declaration: {
          _attributes: {
            version: '1.0',
            encoding: 'UTF-8',
            standalone: 'yes',
          },
        },
        lightResponse: {},
      };
    });

    it('should call "_.set" json being inflated, the id xml selector and id from the json being inflated', () => {
      // action
      service['inflateContext'](inflatedJson, successFullJsonMock);

      // expect
      expect(_.set).toHaveBeenCalledTimes(8);
      expect(_.set).toHaveBeenNthCalledWith(
        1,
        inflatedJson,
        LightResponseXmlSelectors.ID,
        successFullJsonMock.id,
      );
    });

    it('should call "_.set" json being inflated, the in response to id xml selector and in response to id from the json being inflated', () => {
      // action
      service['inflateContext'](inflatedJson, successFullJsonMock);

      // expect
      expect(_.set).toHaveBeenCalledTimes(8);
      expect(_.set).toHaveBeenNthCalledWith(
        2,
        inflatedJson,
        LightResponseXmlSelectors.IN_RESPONSE_TO_ID,
        successFullJsonMock.inResponseToId,
      );
    });

    it('should call "_.set" json being inflated, the issuer xml selector and issuer from the json being inflated', () => {
      // action
      service['inflateContext'](inflatedJson, successFullJsonMock);

      // expect
      expect(_.set).toHaveBeenCalledTimes(8);
      expect(_.set).toHaveBeenNthCalledWith(
        3,
        inflatedJson,
        LightResponseXmlSelectors.ISSUER,
        successFullJsonMock.issuer,
      );
    });

    it('should call "_.set" json being inflated, the ip address selector and the ip address from the json being inflated', () => {
      // action
      service['inflateContext'](inflatedJson, successFullJsonMock);

      // expect
      expect(_.set).toHaveBeenCalledTimes(8);
      expect(_.set).toHaveBeenNthCalledWith(
        4,
        inflatedJson,
        LightResponseXmlSelectors.IP_ADDRESS,
        successFullJsonMock.ipAddress,
      );
    });

    it('should not call "_.set" if the ip address is not present within the json being inflated', () => {
      // action
      service['inflateContext'](inflatedJson, successMandatoryJsonMock);

      // expect
      expect(_.set).not.toHaveBeenCalledWith(
        inflatedJson,
        LightResponseXmlSelectors.IP_ADDRESS,
        expect.any(String),
      );
    });

    it('should call "_.set" json being inflated, the relay state selector and the relay state from the json being inflated', () => {
      // action
      service['inflateContext'](inflatedJson, successFullJsonMock);

      // expect
      expect(_.set).toHaveBeenCalledTimes(8);
      expect(_.set).toHaveBeenNthCalledWith(
        5,
        inflatedJson,
        LightResponseXmlSelectors.RELAY_STATE,
        successFullJsonMock.relayState,
      );
    });

    it('should not call "_.set" if the relay state is not present within the json being inflated', () => {
      // action
      service['inflateContext'](inflatedJson, successMandatoryJsonMock);

      // expect
      expect(_.set).not.toHaveBeenCalledWith(
        inflatedJson,
        LightResponseXmlSelectors.RELAY_STATE,
        expect.any(String),
      );
    });

    it('should call "_.set" json being inflated, the subject name id format xml selector and subject name id format from the json being inflated', () => {
      // action
      service['inflateContext'](inflatedJson, successFullJsonMock);

      // expect
      expect(_.set).toHaveBeenCalledTimes(8);
      expect(_.set).toHaveBeenNthCalledWith(
        6,
        inflatedJson,
        LightResponseXmlSelectors.SUBJECT_NAME_ID_FORMAT,
        `urn:oasis:names:tc:SAML:1.1:nameid-format:${successFullJsonMock.subjectNameIdFormat}`,
      );
    });

    it('should not call "_.set" json being inflated, the subject name id format xml selector and subject name id format from the json being inflated in case of failure', () => {
      // action
      service['inflateContext'](inflatedJson, failureFullJsonMock);

      // expect
      expect(_.set).toHaveBeenCalledTimes(5);
      expect(_.set).not.toHaveBeenCalledWith(
        inflatedJson,
        LightResponseXmlSelectors.SUBJECT_NAME_ID_FORMAT,
        `urn:oasis:names:tc:SAML:1.1:nameid-format:${successFullJsonMock.subjectNameIdFormat}`,
      );
    });

    it('should call "_.set" json being inflated, the subject xml selector and subject from the json being inflated', () => {
      // action
      service['inflateContext'](inflatedJson, successFullJsonMock);

      // expect
      expect(_.set).toHaveBeenCalledTimes(8);
      expect(_.set).toHaveBeenNthCalledWith(
        7,
        inflatedJson,
        LightResponseXmlSelectors.SUBJECT,
        successFullJsonMock.subject,
      );
    });

    it('should not call "_.set" json being inflated, the subject xml selector and subject from the json being inflated in case of failure', () => {
      // action
      service['inflateContext'](inflatedJson, failureFullJsonMock);

      // expect
      expect(_.set).toHaveBeenCalledTimes(5);
      expect(_.set).not.toHaveBeenCalledWith(
        inflatedJson,
        LightResponseXmlSelectors.SUBJECT,
        successFullJsonMock.subject,
      );
    });

    it('should call "_.set" json being inflated, the level of assurance xml selector and the level of assurance from the json being inflated', () => {
      // action
      service['inflateContext'](inflatedJson, successFullJsonMock);

      // expect
      expect(_.set).toHaveBeenCalledTimes(8);
      expect(_.set).toHaveBeenNthCalledWith(
        8,
        inflatedJson,
        LightResponseXmlSelectors.LEVEL_OF_ASSURANCE,
        `http://eidas.europa.eu/LoA/${successFullJsonMock.levelOfAssurance}`,
      );
    });

    it('should not call "_.set" json being inflated, the level of assurance xml selector and the level of assurance from the json being inflated in case of failure', () => {
      // action
      service['inflateContext'](inflatedJson, failureFullJsonMock);

      // expect
      expect(_.set).toHaveBeenCalledTimes(5);
      expect(_.set).not.toHaveBeenCalledWith(
        inflatedJson,
        LightResponseXmlSelectors.LEVEL_OF_ASSURANCE,
        `http://eidas.europa.eu/LoA/${successFullJsonMock.levelOfAssurance}`,
      );
    });

    it('should return the inflated response', () => {
      // setup
      const expectedInflatedResponse = {
        _declaration: inflatedJson._declaration,
        lightResponse: {
          id: {
            _text: successFullJsonMock.id,
          },
          inResponseToId: { _text: successFullJsonMock.inResponseToId },
          ipAddress: { _text: successFullJsonMock.ipAddress },
          issuer: {
            _text: successFullJsonMock.issuer,
          },
          levelOfAssurance: {
            _text: `http://eidas.europa.eu/LoA/${successFullJsonMock.levelOfAssurance}`,
          },
          relayState: { _text: successFullJsonMock.relayState },
          subject: { _text: successFullJsonMock.subject },
          subjectNameIdFormat: {
            _text: `urn:oasis:names:tc:SAML:1.1:nameid-format:${successFullJsonMock.subjectNameIdFormat}`,
          },
        },
      };

      // action
      const result = service['inflateContext'](
        inflatedJson,
        successFullJsonMock,
      );

      // expect
      expect(result).toStrictEqual(expectedInflatedResponse);
    });
  });

  describe('deflateContext', () => {
    beforeEach(() => {
      jest.spyOn(_, 'get');
    });

    it('should call "_.get" with the inflated response and the subject name id format xml selector', () => {
      // action
      service['deflateContext'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(8);
      expect(_.get).toHaveBeenNthCalledWith(
        1,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.SUBJECT_NAME_ID_FORMAT,
      );
    });

    it('should call "getLastElementInUrlOrUrn" with the subject name id format retreived from corresponding call to "_.get" on the inflated response', () => {
      // setup
      const expectedSubjectNameIdFormat =
        'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified';

      // action
      service['deflateContext'](lightResponseSuccessFullJsonMock);

      // expect
      expect(
        lightCommonsServiceMock.getLastElementInUrlOrUrn,
      ).toHaveBeenCalledTimes(2);
      expect(
        lightCommonsServiceMock.getLastElementInUrlOrUrn,
      ).toHaveBeenNthCalledWith(1, expectedSubjectNameIdFormat);
    });

    it('should call "_.get" with the inflated response and the level of assurance xml selector', () => {
      // action
      service['deflateContext'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(8);
      expect(_.get).toHaveBeenNthCalledWith(
        2,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.LEVEL_OF_ASSURANCE,
      );
    });

    it('should call "getLastElementInUrlOrUrn" with the level of assurance retreived from corresponding call to "_.get" on the inflated response', () => {
      // setup
      const expectedLoa = 'http://eidas.europa.eu/LoA/substantial';

      // action
      service['deflateContext'](lightResponseSuccessFullJsonMock);

      // expect
      expect(
        lightCommonsServiceMock.getLastElementInUrlOrUrn,
      ).toHaveBeenCalledTimes(2);
      expect(
        lightCommonsServiceMock.getLastElementInUrlOrUrn,
      ).toHaveBeenNthCalledWith(2, expectedLoa);
    });

    it('should call "_.get" with the inflated response and the id xml selector', () => {
      // action
      service['deflateContext'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(8);
      expect(_.get).toHaveBeenNthCalledWith(
        3,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.ID,
      );
    });

    it('should call "_.get" with the inflated response and the issuer xml selector', () => {
      // action
      service['deflateContext'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(8);
      expect(_.get).toHaveBeenNthCalledWith(
        4,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.ISSUER,
      );
    });

    it('should call "_.get" with the inflated response and the subject xml selector', () => {
      // action
      service['deflateContext'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(8);
      expect(_.get).toHaveBeenNthCalledWith(
        5,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.SUBJECT,
      );
    });

    it('should call "_.get" with the inflated response and the in response to id xml selector', () => {
      // action
      service['deflateContext'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(8);
      expect(_.get).toHaveBeenNthCalledWith(
        6,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.IN_RESPONSE_TO_ID,
      );
    });

    it('should call "_.get" with the inflated response and the relay state xml selector', () => {
      // action
      service['deflateContext'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(8);
      expect(_.get).toHaveBeenNthCalledWith(
        7,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.RELAY_STATE,
      );
    });

    it('should not set relay state of the context object if relay state does not exist on the inflated response', () => {
      // action
      const result = service['deflateContext'](
        lightResponseSuccessMandatoryJsonMock,
      );

      // expect
      expect(result).not.toHaveProperty('relayState');
    });

    it('should call "_.get" with the inflated response and the ip address xml selector', () => {
      // action
      service['deflateContext'](lightResponseSuccessFullJsonMock);

      // expect
      expect(_.get).toHaveBeenCalledTimes(8);
      expect(_.get).toHaveBeenNthCalledWith(
        8,
        lightResponseSuccessFullJsonMock,
        LightResponseXmlSelectors.IP_ADDRESS,
      );
    });

    it('should not set ip address of the context object if ip address does not exist on the inflated response', () => {
      // action
      const result = service['deflateContext'](
        lightResponseSuccessMandatoryJsonMock,
      );

      // expect
      expect(result).not.toHaveProperty('ipAddress');
    });

    it('should return the context object', () => {
      // setup
      const expectedContext = {
        id: successFullJsonMock.id,
        inResponseToId: successFullJsonMock.inResponseToId,
        ipAddress: successFullJsonMock.ipAddress,
        issuer: successFullJsonMock.issuer,
        levelOfAssurance: successFullJsonMock.levelOfAssurance,
        relayState: successFullJsonMock.relayState,
        subject: successFullJsonMock.subject,
        subjectNameIdFormat: successFullJsonMock.subjectNameIdFormat,
      };

      // action
      const result = service['deflateContext'](
        lightResponseSuccessFullJsonMock,
      );

      // expect
      expect(result).toStrictEqual(expectedContext);
    });
  });

  describe('inflateAttributes', () => {
    let inflatedJson: IJsonifiedLightResponseXml;

    beforeEach(() => {
      inflatedJson = {
        _declaration: {
          _attributes: {
            version: '1.0',
            encoding: 'UTF-8',
            standalone: 'yes',
          },
        },
        lightResponse: {},
      };
    });

    it('should call "buildAttribute" with the key value pairs of the attribute object', () => {
      // setup
      jest.spyOn(_, 'set');

      service['buildAttribute'] = jest.fn();

      const expectedArguments = [
        ['personIdentifier', ['BE/FR/12345']],
        ['birthName', ['Ωνάσης', 'Onases']],
      ];

      // action
      service['inflateAttributes'](inflatedJson, ({
        personIdentifier: successFullJsonMock.attributes.personIdentifier,
        birthName: successFullJsonMock.attributes.birthName,
      } as unknown) as EidasResponseAttributes);

      // expect
      expect(service['buildAttribute']).toHaveBeenCalledTimes(2);
      expect(service['buildAttribute']).toHaveBeenNthCalledWith(
        1,
        expectedArguments[0],
        0,
        expectedArguments,
      );
      expect(service['buildAttribute']).toHaveBeenNthCalledWith(
        2,
        expectedArguments[1],
        1,
        expectedArguments,
      );
    });

    it('should call "_.set" with json being inflated, the attributes xml selector, and the defintion and value object for each present attibutes', () => {
      // setup
      jest.spyOn(_, 'set').mockImplementation();

      const expectedAttributes = [
        {
          definition: {
            _text:
              'http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier',
          },
          value: {
            _text: 'BE/FR/12345',
          },
        },
        {
          definition: {
            _text: 'http://eidas.europa.eu/attributes/naturalperson/BirthName',
          },
          value: [
            {
              _text: 'Ωνάσης',
            },
            {
              _text: 'Onases',
            },
          ],
        },
      ];

      service['buildAttribute'] = jest
        .fn()
        .mockReturnValueOnce(expectedAttributes[0])
        .mockReturnValueOnce(expectedAttributes[1]);

      // action
      service['inflateAttributes'](inflatedJson, ({
        personIdentifier: successFullJsonMock.attributes.personIdentifier,
        birthName: successFullJsonMock.attributes.birthName,
      } as unknown) as EidasResponseAttributes);

      // expect
      expect(_.set).toHaveBeenCalledTimes(1);
      expect(_.set).toHaveBeenCalledWith(
        inflatedJson,
        LightResponseXmlSelectors.ATTRIBUTES,
        expectedAttributes,
      );
    });

    it('should return inflated response', () => {
      // setup
      jest.spyOn(_, 'set');

      const expectedLightResponse = {
        ...inflatedJson,
        lightResponse: {
          attributes: {
            attribute: [
              {
                definition: {
                  _text:
                    'http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier',
                },
                value: {
                  _text: 'BE/FR/12345',
                },
              },
              {
                definition: {
                  _text:
                    'http://eidas.europa.eu/attributes/naturalperson/BirthName',
                },
                value: [
                  {
                    _text: 'Ωνάσης',
                  },
                  {
                    _text: 'Onases',
                  },
                ],
              },
            ],
          },
        },
      };

      service['buildAttribute'] = jest
        .fn()
        .mockReturnValueOnce(
          expectedLightResponse.lightResponse.attributes.attribute[0],
        )
        .mockReturnValueOnce(
          expectedLightResponse.lightResponse.attributes.attribute[1],
        );

      // action
      const result = service['inflateAttributes'](inflatedJson, ({
        personIdentifier: successFullJsonMock.attributes.personIdentifier,
        birthName: successFullJsonMock.attributes.birthName,
      } as unknown) as EidasResponseAttributes);

      // expect
      expect(result).toStrictEqual(expectedLightResponse);
    });
  });

  describe('deflateAttributes', () => {
    it('should call "_.get" with the inflatedResponse attribute and corresponding xml selector path', () => {
      // setup
      jest.spyOn(_, 'get');
      service['getAttribute'] = jest
        .fn()
        .mockReturnValueOnce(successFullJsonMock.attributes);

      // action
      service['deflateAttributes'](lightResponseSuccessFullJsonMock);

      // assertion
      expect(_.get).toHaveBeenCalledTimes(1);
      expect(_.get).toHaveBeenCalledWith(
        lightResponseSuccessFullJsonMock,
        'lightResponse.attributes.attribute',
      );
    });

    it('should call getAttribute with the inflated json object version of the attributes', () => {
      // setup
      service['getAttribute'] = jest.fn();

      // action
      service['deflateAttributes'](lightResponseSuccessFullJsonMock);

      // assertion
      expect(service['getAttribute']).toHaveBeenCalledTimes(8);
    });

    it('should return the attributes object of the light response jsonified', () => {
      // setup
      jest.spyOn(_, 'set');

      service['getAttribute'] = jest
        .fn()
        .mockReturnValue(successFullJsonMock.attributes);

      // action
      const result = service['deflateAttributes'](
        lightResponseSuccessFullJsonMock,
      );

      // assertion
      expect(result).toEqual(successFullJsonMock.attributes);
    });
  });

  describe('buildAttribute', () => {
    it('should call "buildAdress" with the given content as value if the key is "current address"', () => {
      // setup
      const key = 'currentAddress';
      const content = {
        poBox: '1234',
        locatorDesignator: '28',
        locatorName: 'DIGIT building',
        cvaddressArea: 'Etterbeek',
        thoroughfare: 'Rue Belliard',
        postName: 'ETTERBEEK CHASSE',
        adminunitFirstline: 'BE',
        adminunitSecondline: 'ETTERBEEK',
        postCode: '1040',
      };
      service['buildAddress'] = jest.fn();

      // action
      service['buildAttribute']([key, content]);

      // assertion
      expect(service['buildAddress']).toHaveBeenCalledTimes(1);
      expect(service['buildAddress']).toBeCalledWith(content);
    });

    it('should call "buildValues" with the given content as value if the key is not "current address"', () => {
      // setup
      const key = 'gender';
      const content = 'Male';
      service['buildValues'] = jest.fn();

      // action
      service['buildAttribute']([key, content]);

      // assertion
      expect(service['buildValues']).toHaveBeenCalledTimes(1);
      expect(service['buildValues']).toBeCalledWith(content);
    });

    it('should call "_.set" with the attribute object being built, the attribute definition object xml selector, and the string to set as value to the _text element of the object', () => {
      // setup
      const key = 'gender';
      const content = 'Male';
      service['buildValues'] = jest.fn().mockReturnValueOnce({ _text: 'Male' });
      jest.spyOn(_, 'set').mockImplementation();

      // action
      service['buildAttribute']([key, content]);

      // assertion
      expect(_.set).toHaveBeenCalledTimes(2);
      expect(_.set).toBeCalledWith(
        {},
        'definition._text',
        'http://eidas.europa.eu/attributes/naturalperson/Gender',
      );
      expect(_.set).toBeCalledWith({}, 'value', { _text: 'Male' });
    });

    it('should return the definition and value object of the corresponding attribute', () => {
      // setup
      const key = 'gender';
      const content = 'Male';
      service['buildValues'] = jest.fn().mockReturnValueOnce({ _text: 'Male' });

      // action
      const result = service['buildAttribute']([key, content]);

      // assertion
      expect(result).toEqual({
        definition: {
          _text: 'http://eidas.europa.eu/attributes/naturalperson/Gender',
        },
        value: { _text: 'Male' },
      });
    });
  });

  describe('getAttribute', () => {
    let inflatedAttribute: IJsonifiedXml;

    beforeEach(() => {
      jest.spyOn(_, 'get');
    });

    it('should call "_.get" to retrieve the attribute definition', () => {
      // setup
      service['getValues'] = jest.fn();

      const expectedDefinition =
        'http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier';
      inflatedAttribute = {
        definition: {
          _text: expectedDefinition,
        },
      };

      // action
      service['getAttribute']({}, inflatedAttribute);

      // assertion
      expect(_.get).toHaveBeenCalledTimes(2);
      expect(_.get).toHaveBeenNthCalledWith(
        1,
        inflatedAttribute,
        LightResponseXmlSelectors.ATTRIBUTE_DEFINITION,
      );
    });

    it('should call "_.get" to retrieve the attribute value', () => {
      // setup
      service['getValues'] = jest.fn();

      const expectedDefinition =
        'http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier';
      inflatedAttribute = {
        definition: {
          _text: expectedDefinition,
        },
      };

      // action
      service['getAttribute']({}, inflatedAttribute);

      // assertion
      expect(_.get).toHaveBeenCalledTimes(2);
      expect(_.get).toHaveBeenNthCalledWith(
        2,
        inflatedAttribute,
        LightResponseXmlSelectors.ATTRIBUTE_VALUE,
      );
    });

    it('should call "getLastElementInUrlOrUrn" with the attribute definition to extract a key', () => {
      // setup
      service['getValues'] = jest.fn();

      const expectedDefinition =
        'http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier';
      inflatedAttribute = {
        definition: {
          _text: expectedDefinition,
        },
      };

      // action
      service['getAttribute']({}, inflatedAttribute);

      // expect
      expect(
        lightCommonsServiceMock.getLastElementInUrlOrUrn,
      ).toHaveBeenCalledTimes(1);
      expect(
        lightCommonsServiceMock.getLastElementInUrlOrUrn,
      ).toHaveBeenCalledWith(expectedDefinition);
    });

    it('should set the first char of the key to lowercase', () => {
      // setup
      const expectedInflatedKey = 'PersonIdentifier';

      lightCommonsServiceMock.getLastElementInUrlOrUrn = jest
        .fn()
        .mockReturnValueOnce(expectedInflatedKey);
      service['getValues'] = jest.fn();
      jest.spyOn(_, 'lowerFirst');

      const expectedDefinition = `http://eidas.europa.eu/attributes/naturalperson/${expectedInflatedKey}`;
      inflatedAttribute = {
        definition: {
          _text: expectedDefinition,
        },
      };

      // action
      service['getAttribute']({}, inflatedAttribute);

      // expect
      expect(_.lowerFirst).toHaveBeenCalledTimes(1);
      expect(_.lowerFirst).toHaveBeenCalledWith(expectedInflatedKey);
    });

    it('should extract the values calling "getValues" with the attribute value if key is not "currentAddress"', () => {
      // setup
      service['getValues'] = jest.fn();

      const expectedInflatedKey = 'PersonIdentifier';
      const expectedDefinition = `http://eidas.europa.eu/attributes/naturalperson/${expectedInflatedKey}`;
      const expectedValue = {
        _text: 'BE/FR/12345',
      };
      inflatedAttribute = {
        definition: {
          _text: expectedDefinition,
        },
        value: expectedValue,
      };

      // action
      service['getAttribute']({}, inflatedAttribute);

      // expect
      expect(service['getValues']).toHaveBeenCalledTimes(1);
      expect(service['getValues']).toHaveBeenCalledWith(expectedValue);
    });

    it('should not call getAddress if key is not "currentAddress"', () => {
      // setup
      service['getValues'] = jest.fn();
      service['getAddress'] = jest.fn();

      const expectedInflatedKey = 'PersonIdentifier';
      const expectedDefinition = `http://eidas.europa.eu/attributes/naturalperson/${expectedInflatedKey}`;
      const expectedValue = {
        _text: 'BE/FR/12345',
      };
      inflatedAttribute = {
        definition: {
          _text: expectedDefinition,
        },
        value: expectedValue,
      };

      // action
      service['getAttribute']({}, inflatedAttribute);

      // expect
      expect(service['getAddress']).toHaveBeenCalledTimes(0);
    });

    it('should extract the values calling "getAddress" with the attribute value if key is "currentAddress"', () => {
      // setup
      const expectedInflatedKey = 'CurrentAddress';

      lightCommonsServiceMock.getLastElementInUrlOrUrn = jest
        .fn()
        .mockReturnValueOnce(expectedInflatedKey);
      service['getAddress'] = jest.fn();

      const expectedValue = {
        _text:
          'PGVpZGFzLW5hdHVyYWw6UG9Cb3g+MTIzNDwvZWlkYXMtbmF0dXJhbDpQb0JveD4KPGVpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+Mjg8L2VpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+CjxlaWRhcy1uYXR1cmFsOkxvY2F0b3JOYW1lPkRJR0lUIGJ1aWxkaW5nPC9laWRhcy1uYXR1cmFsOkxvY2F0b3JOYW1lPgo8ZWlkYXMtbmF0dXJhbDpDdmFkZHJlc3NBcmVhPkV0dGVyYmVlazwvZWlkYXMtbmF0dXJhbDpDdmFkZHJlc3NBcmVhPgo8ZWlkYXMtbmF0dXJhbDpUaG9yb3VnaGZhcmU+UnVlIEJlbGxpYXJkPC9laWRhcy1uYXR1cmFsOlRob3JvdWdoZmFyZT4KPGVpZGFzLW5hdHVyYWw6UG9zdE5hbWU+RVRURVJCRUVLIENIQVNTRTwvZWlkYXMtbmF0dXJhbDpQb3N0TmFtZT4KPGVpZGFzLW5hdHVyYWw6QWRtaW51bml0Rmlyc3RsaW5lPkJFPC9laWRhcy1uYXR1cmFsOkFkbWludW5pdEZpcnN0bGluZT4KPGVpZGFzLW5hdHVyYWw6QWRtaW51bml0U2Vjb25kbGluZT5FVFRFUkJFRUs8L2VpZGFzLW5hdHVyYWw6QWRtaW51bml0U2Vjb25kbGluZT4KPGVpZGFzLW5hdHVyYWw6UG9zdENvZGU+MTA0MDwvZWlkYXMtbmF0dXJhbDpQb3N0Q29kZT4K',
      };
      inflatedAttribute = {
        definition: {
          _text: `http://eidas.europa.eu/attributes/naturalperson/${expectedInflatedKey}`,
        },
        value: expectedValue,
      };

      // action
      service['getAttribute']({}, inflatedAttribute);

      // expect
      expect(service['getAddress']).toHaveBeenCalledTimes(1);
      expect(service['getAddress']).toHaveBeenCalledWith(expectedValue);
    });

    it('should not call "getValues" if key is "currentAddress"', () => {
      // setup
      const expectedInflatedKey = 'CurrentAddress';

      lightCommonsServiceMock.getLastElementInUrlOrUrn = jest
        .fn()
        .mockReturnValueOnce(expectedInflatedKey);
      service['getAddress'] = jest.fn();
      service['getValues'] = jest.fn();

      const expectedValue = {
        _text:
          'PGVpZGFzLW5hdHVyYWw6UG9Cb3g+MTIzNDwvZWlkYXMtbmF0dXJhbDpQb0JveD4KPGVpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+Mjg8L2VpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+CjxlaWRhcy1uYXR1cmFsOkxvY2F0b3JOYW1lPkRJR0lUIGJ1aWxkaW5nPC9laWRhcy1uYXR1cmFsOkxvY2F0b3JOYW1lPgo8ZWlkYXMtbmF0dXJhbDpDdmFkZHJlc3NBcmVhPkV0dGVyYmVlazwvZWlkYXMtbmF0dXJhbDpDdmFkZHJlc3NBcmVhPgo8ZWlkYXMtbmF0dXJhbDpUaG9yb3VnaGZhcmU+UnVlIEJlbGxpYXJkPC9laWRhcy1uYXR1cmFsOlRob3JvdWdoZmFyZT4KPGVpZGFzLW5hdHVyYWw6UG9zdE5hbWU+RVRURVJCRUVLIENIQVNTRTwvZWlkYXMtbmF0dXJhbDpQb3N0TmFtZT4KPGVpZGFzLW5hdHVyYWw6QWRtaW51bml0Rmlyc3RsaW5lPkJFPC9laWRhcy1uYXR1cmFsOkFkbWludW5pdEZpcnN0bGluZT4KPGVpZGFzLW5hdHVyYWw6QWRtaW51bml0U2Vjb25kbGluZT5FVFRFUkJFRUs8L2VpZGFzLW5hdHVyYWw6QWRtaW51bml0U2Vjb25kbGluZT4KPGVpZGFzLW5hdHVyYWw6UG9zdENvZGU+MTA0MDwvZWlkYXMtbmF0dXJhbDpQb3N0Q29kZT4K',
      };
      inflatedAttribute = {
        definition: {
          _text: `http://eidas.europa.eu/attributes/naturalperson/${expectedInflatedKey}`,
        },
        value: expectedValue,
      };

      // action
      service['getAttribute']({}, inflatedAttribute);

      // expect
      expect(service['getValues']).toHaveBeenCalledTimes(0);
    });

    it('should return the attribute as an object if there is only one value', () => {
      // setup
      inflatedAttribute = {
        definition: {
          _text:
            'http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier',
        },
        value: {
          _text: 'BE/FR/12345',
        },
      };
      const expectedAttribute = {
        personIdentifier: ['BE/FR/12345'],
      };

      // action
      const result = service['getAttribute']({}, inflatedAttribute);

      // expect
      expect(result).toStrictEqual(expectedAttribute);
    });

    it('should return the attribute as an object if there is multiples values', () => {
      // setup
      inflatedAttribute = {
        definition: {
          _text: 'http://eidas.europa.eu/attributes/naturalperson/BirthName',
        },
        value: [
          {
            _text: 'Ωνάσης',
          },
          {
            _text: 'Onases',
          },
        ],
      };
      const expectedAttribute = {
        birthName: ['Ωνάσης', 'Onases'],
      };

      // action
      const result = service['getAttribute']({}, inflatedAttribute);

      // expect
      expect(result).toStrictEqual(expectedAttribute);
    });
  });

  describe('buildAddress', () => {
    it('should call "_.upperFirst" with each key of the object', () => {
      // setup
      jest.spyOn(_, 'upperFirst');
      const address = {
        poBox: '1234',
        locatorDesignator: '28',
        locatorName: 'DIGIT building',
        cvaddressArea: 'Etterbeek',
        thoroughfare: 'Rue Belliard',
        postName: 'ETTERBEEK CHASSE',
        adminunitFirstline: 'BE',
        adminunitSecondline: 'ETTERBEEK',
        postCode: '1040',
      };

      // action
      service['buildAddress'](address);

      // assertion
      expect(_.upperFirst).toHaveBeenCalledTimes(9);
      expect(_.upperFirst).toHaveBeenCalledWith('poBox');
      expect(_.upperFirst).toHaveBeenCalledWith('locatorDesignator');
      expect(_.upperFirst).toHaveBeenCalledWith('locatorName');
      expect(_.upperFirst).toHaveBeenCalledWith('cvaddressArea');
      expect(_.upperFirst).toHaveBeenCalledWith('thoroughfare');
      expect(_.upperFirst).toHaveBeenCalledWith('postName');
      expect(_.upperFirst).toHaveBeenCalledWith('adminunitFirstline');
      expect(_.upperFirst).toHaveBeenCalledWith('adminunitSecondline');
      expect(_.upperFirst).toHaveBeenCalledWith('postCode');
    });

    it('should return a base64 string', () => {
      // setup
      const expectedBase64 =
        'PGVpZGFzLW5hdHVyYWw6UG9Cb3g+MTIzNDwvZWlkYXMtbmF0dXJhbDpQb0JveD4KPGVpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+Mjg8L2VpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+CjxlaWRhcy1uYXR1cmFsOkxvY2F0b3JOYW1lPkRJR0lUIGJ1aWxkaW5nPC9laWRhcy1uYXR1cmFsOkxvY2F0b3JOYW1lPgo8ZWlkYXMtbmF0dXJhbDpDdmFkZHJlc3NBcmVhPkV0dGVyYmVlazwvZWlkYXMtbmF0dXJhbDpDdmFkZHJlc3NBcmVhPgo8ZWlkYXMtbmF0dXJhbDpUaG9yb3VnaGZhcmU+UnVlIEJlbGxpYXJkPC9laWRhcy1uYXR1cmFsOlRob3JvdWdoZmFyZT4KPGVpZGFzLW5hdHVyYWw6UG9zdE5hbWU+RVRURVJCRUVLIENIQVNTRTwvZWlkYXMtbmF0dXJhbDpQb3N0TmFtZT4KPGVpZGFzLW5hdHVyYWw6QWRtaW51bml0Rmlyc3RsaW5lPkJFPC9laWRhcy1uYXR1cmFsOkFkbWludW5pdEZpcnN0bGluZT4KPGVpZGFzLW5hdHVyYWw6QWRtaW51bml0U2Vjb25kbGluZT5FVFRFUkJFRUs8L2VpZGFzLW5hdHVyYWw6QWRtaW51bml0U2Vjb25kbGluZT4KPGVpZGFzLW5hdHVyYWw6UG9zdENvZGU+MTA0MDwvZWlkYXMtbmF0dXJhbDpQb3N0Q29kZT4K';
      const address = {
        poBox: '1234',
        locatorDesignator: '28',
        locatorName: 'DIGIT building',
        cvaddressArea: 'Etterbeek',
        thoroughfare: 'Rue Belliard',
        postName: 'ETTERBEEK CHASSE',
        adminunitFirstline: 'BE',
        adminunitSecondline: 'ETTERBEEK',
        postCode: '1040',
      };

      // action
      const result = service['buildAddress'](address);

      // expect
      expect(result).toEqual(expectedBase64);
    });

    it('should be base64 decoded as an eidas address attribute', () => {
      // setup
      const expected = `<eidas-natural:PoBox>1234</eidas-natural:PoBox>\n<eidas-natural:LocatorDesignator>28</eidas-natural:LocatorDesignator>\n<eidas-natural:LocatorName>DIGIT building</eidas-natural:LocatorName>\n<eidas-natural:CvaddressArea>Etterbeek</eidas-natural:CvaddressArea>\n<eidas-natural:Thoroughfare>Rue Belliard</eidas-natural:Thoroughfare>\n<eidas-natural:PostName>ETTERBEEK CHASSE</eidas-natural:PostName>\n<eidas-natural:AdminunitFirstline>BE</eidas-natural:AdminunitFirstline>\n<eidas-natural:AdminunitSecondline>ETTERBEEK</eidas-natural:AdminunitSecondline>\n<eidas-natural:PostCode>1040</eidas-natural:PostCode>\n`;
      const address = {
        poBox: '1234',
        locatorDesignator: '28',
        locatorName: 'DIGIT building',
        cvaddressArea: 'Etterbeek',
        thoroughfare: 'Rue Belliard',
        postName: 'ETTERBEEK CHASSE',
        adminunitFirstline: 'BE',
        adminunitSecondline: 'ETTERBEEK',
        postCode: '1040',
      };

      // action
      const result = service['buildAddress'](address);

      // expect
      expect(Buffer.from(result, 'base64').toString('utf8')).toEqual(expected);
    });
  });

  describe('getAddress', () => {
    it('should not keep empty elements in the splitted inflatedAddress', () => {
      // setup
      const inflatedAddress = {
        _text:
          'PGVpZGFzLW5hdHVyYWw6UG9Cb3g+MTIzNDwvZWlkYXMtbmF0dXJhbDpQb0JveD4KPGVpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+Mjg8L2VpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+CjxlaWRhcy1uYXR1cmFsOkxvY2F0b3JOYW1lPkRJR0lUIGJ1aWxkaW5nPC9laWRhcy1uYXR1cmFsOkxvY2F0b3JOYW1lPgo8ZWlkYXMtbmF0dXJhbDpDdmFkZHJlc3NBcmVhPkV0dGVyYmVlazwvZWlkYXMtbmF0dXJhbDpDdmFkZHJlc3NBcmVhPgoKCjxlaWRhcy1uYXR1cmFsOlRob3JvdWdoZmFyZT5SdWUgQmVsbGlhcmQ8L2VpZGFzLW5hdHVyYWw6VGhvcm91Z2hmYXJlPgo8ZWlkYXMtbmF0dXJhbDpQb3N0TmFtZT5FVFRFUkJFRUsgQ0hBU1NFPC9laWRhcy1uYXR1cmFsOlBvc3ROYW1lPgoKPGVpZGFzLW5hdHVyYWw6QWRtaW51bml0Rmlyc3RsaW5lPkJFPC9laWRhcy1uYXR1cmFsOkFkbWludW5pdEZpcnN0bGluZT4KPGVpZGFzLW5hdHVyYWw6QWRtaW51bml0U2Vjb25kbGluZT5FVFRFUkJFRUs8L2VpZGFzLW5hdHVyYWw6QWRtaW51bml0U2Vjb25kbGluZT4KPGVpZGFzLW5hdHVyYWw6UG9zdENvZGU+MTA0MDwvZWlkYXMtbmF0dXJhbDpQb3N0Q29kZT4K',
      };

      // action / expect
      expect(() => service['getAddress'](inflatedAddress)).not.toThrow();
    });

    it('should return an object of current address', () => {
      // setup
      const inflatedAddress = {
        _text:
          'PGVpZGFzLW5hdHVyYWw6UG9Cb3g+MTIzNDwvZWlkYXMtbmF0dXJhbDpQb0JveD4KPGVpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+Mjg8L2VpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+CjxlaWRhcy1uYXR1cmFsOkxvY2F0b3JOYW1lPkRJR0lUIGJ1aWxkaW5nPC9laWRhcy1uYXR1cmFsOkxvY2F0b3JOYW1lPgo8ZWlkYXMtbmF0dXJhbDpDdmFkZHJlc3NBcmVhPkV0dGVyYmVlazwvZWlkYXMtbmF0dXJhbDpDdmFkZHJlc3NBcmVhPgo8ZWlkYXMtbmF0dXJhbDpUaG9yb3VnaGZhcmU+UnVlIEJlbGxpYXJkPC9laWRhcy1uYXR1cmFsOlRob3JvdWdoZmFyZT4KPGVpZGFzLW5hdHVyYWw6UG9zdE5hbWU+RVRURVJCRUVLIENIQVNTRTwvZWlkYXMtbmF0dXJhbDpQb3N0TmFtZT4KPGVpZGFzLW5hdHVyYWw6QWRtaW51bml0Rmlyc3RsaW5lPkJFPC9laWRhcy1uYXR1cmFsOkFkbWludW5pdEZpcnN0bGluZT4KPGVpZGFzLW5hdHVyYWw6QWRtaW51bml0U2Vjb25kbGluZT5FVFRFUkJFRUs8L2VpZGFzLW5hdHVyYWw6QWRtaW51bml0U2Vjb25kbGluZT4KPGVpZGFzLW5hdHVyYWw6UG9zdENvZGU+MTA0MDwvZWlkYXMtbmF0dXJhbDpQb3N0Q29kZT4K',
      };

      // action
      const result = service['getAddress'](inflatedAddress);

      // expectd
      expect(result).toEqual(successFullJsonMock.attributes.currentAddress);
    });
  });

  it('should not return elements that do not respect the expected format', () => {
    // setup
    /* string that gets out from base 64
      <eidas-natural:LocatorDesignator>28</eidas-natural:LocatorDesignator>
      <:PoboxWrong2020>tryAgain</:PoboxWrong2020>
    */
    const inflatedAddress = {
      _text:
        'PGVpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+Mjg8L2VpZGFzLW5hdHVyYWw6TG9jYXRvckRlc2lnbmF0b3I+Cjw6UG9ib3hXcm9uZzIwMjA+dHJ5QWdhaW48LzpQb2JveFdyb25nMjAyMD4=',
    };
    jest.spyOn(_, 'lowerFirst').mockImplementation();

    // action
    service['getAddress'](inflatedAddress);

    //assertion
    expect(_.lowerFirst).toHaveBeenCalledTimes(1);
  });

  describe('buildValues', () => {
    it('should return an array of objects if the content received is an instance of array', () => {
      // setup
      const valuesToInflate = [
        'firstValueToSet',
        'secondValueToSet',
        'thirdValueToSet',
        'fourthValueToSet',
      ];
      const expected = [
        { _text: 'firstValueToSet' },
        { _text: 'secondValueToSet' },
        { _text: 'thirdValueToSet' },
        { _text: 'fourthValueToSet' },
      ];

      // action
      const result = service['buildValues'](valuesToInflate);

      // expect
      expect(result).toEqual(expected);
    });

    it('should return an object if the content received has a length of one', () => {
      // setup
      const valueToInflate = ['onlyValueToSet'];
      const expected = { _text: 'onlyValueToSet' };

      // action
      const result = service['buildValues'](valueToInflate);

      // expect
      expect(result).toEqual(expected);
    });
  });

  describe('getValues', () => {
    it('should return an array of string if the content received  has a length greater than one', () => {
      // setup
      const valuesToDeflate = [
        {
          _text: 'firstValueToExtract',
        },
        {
          _text: 'secondValueToExtract',
        },
        {
          _text: 'thirdValueToExtract',
        },
        {
          _text: 'fourthValueToExtract',
        },
      ];
      jest.spyOn(_, 'get');

      // action
      const result = service['getValues'](valuesToDeflate);

      // expect
      expect(result).toEqual([
        'firstValueToExtract',
        'secondValueToExtract',
        'thirdValueToExtract',
        'fourthValueToExtract',
      ]);
    });

    it('should return an array containing one element if the content received is not an instance of array', () => {
      // setup
      const valuesToDeflate = {
        _text: 'onlyValueToExtract',
      };
      jest.spyOn(_, 'get');

      // action
      const result = service['getValues'](valuesToDeflate);

      // expect
      expect(result).toEqual(['onlyValueToExtract']);
    });
  });
});
