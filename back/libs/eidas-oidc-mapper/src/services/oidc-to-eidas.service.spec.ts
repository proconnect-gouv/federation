import { Test, TestingModule } from '@nestjs/testing';
import { AcrValues, OidcError } from '@fc/oidc';
import { LoggerService } from '@fc/logger';
import { OidcToEidasService } from './oidc-to-eidas.service';
import {
  EidasAttributes,
  EidasLevelOfAssurances,
  EidasStatusCodes,
  EidasSubStatusCodes,
} from '@fc/eidas';

describe('OidcToEidasService', () => {
  let service: OidcToEidasService;

  const loggerServiceMock = {
    error: jest.fn(),
    setContext: jest.fn(),
  };

  const claimsMock = {
    sub: 'b155a2129530e5fd3f6b95275b6da72a99ea1a486b8b33148abb4a62ddfb3609v2',
    gender: 'female',
    birthdate: '1962-08-24',
    birthcountry: '99100',
    birthplace: '75107',
    // oidc parameter
    // eslint-disable-next-line @typescript-eslint/naming-convention
    given_name: 'Angela Claire Louise',
    // oidc parameter
    // eslint-disable-next-line @typescript-eslint/naming-convention
    family_name: 'DUBOIS',
    email: 'wossewodda-3728@yopmail.com',
    // oidc parameter
    // eslint-disable-next-line @typescript-eslint/naming-convention
    preferred_username: 'DUMEUBLE',
  };

  const requestedAttributesMock = [
    EidasAttributes.PERSON_IDENTIFIER,
    EidasAttributes.CURRENT_FAMILY_NAME,
    EidasAttributes.CURRENT_GIVEN_NAME,
    EidasAttributes.DATE_OF_BIRTH,
  ];

  const partialSuccessResponseMock = {
    attributes: {
      currentFamilyName: ['DUMEUBLE'],
      currentGivenName: ['Angela', 'Claire', 'Louise'],
      dateOfBirth: ['1962-08-24'],
      personIdentifier: [
        'b155a2129530e5fd3f6b95275b6da72a99ea1a486b8b33148abb4a62ddfb3609v2',
      ],
    },
    levelOfAssurance: EidasLevelOfAssurances.SUBSTANTIAL,
    status: { failure: false, statusCode: EidasStatusCodes.SUCCESS },
    subject:
      'b155a2129530e5fd3f6b95275b6da72a99ea1a486b8b33148abb4a62ddfb3609v2',
  };

  const acrMock = AcrValues.EIDAS2;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [OidcToEidasService, LoggerService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<OidcToEidasService>(OidcToEidasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set the logger context', () => {
    // expect
    expect(loggerServiceMock.setContext).toHaveBeenCalledTimes(1);
    expect(loggerServiceMock.setContext).toHaveBeenCalledWith(
      'OidcToEidasService',
    );
  });

  describe('mapSuccessPartialResponse', () => {
    const mapAttributesMock = jest.fn();

    beforeEach(() => {
      service['mapAttributes'] = mapAttributesMock;
    });

    it('should map the attributes with the claims and the requestedAttributes', () => {
      // action
      service.mapSuccessPartialResponse(
        claimsMock,
        acrMock,
        requestedAttributesMock,
      );

      // expect
      expect(mapAttributesMock).toHaveBeenCalledTimes(1);
      expect(mapAttributesMock).toHaveBeenCalledWith(
        claimsMock,
        requestedAttributesMock,
      );
    });

    it('should return the partial response', () => {
      // setup
      mapAttributesMock.mockReturnValueOnce(
        partialSuccessResponseMock.attributes,
      );

      // action
      const result = service.mapSuccessPartialResponse(
        claimsMock,
        acrMock,
        requestedAttributesMock,
      );

      // expect
      expect(result).toStrictEqual(partialSuccessResponseMock);
    });
  });

  describe('mapFailurePartialResponse', () => {
    it('should log the error as an error if error is an instance of Error', () => {
      // setup
      const error = new Error('This is an error');

      // action
      service.mapFailurePartialResponse(error);

      // expect
      expect(loggerServiceMock.error).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.error).toHaveBeenCalledWith(error);
    });

    it('should return a partial response with an "internal_error" with code Y000000 if error is an instance of Error', () => {
      // setup
      const error = new Error('This is an error');
      const partialFailureResponse = {
        status: {
          failure: true,
          statusCode: EidasStatusCodes.RESPONDER,
          statusMessage:
            '[internal_error]: FranceConnect encountered an unexpected error, please contact the support (Code Y000000).',
          subStatusCode: EidasSubStatusCodes.AUTHN_FAILED,
        },
      };

      // action
      const result = service.mapFailurePartialResponse(error);

      // expect
      expect(result).toStrictEqual(partialFailureResponse);
    });

    it('should return a partial response with an oidc error if error is an oidc error', () => {
      // setup
      const error: OidcError = {
        error: 'invalid_scope',
        // oidc parameter
        // eslint-disable-next-line @typescript-eslint/naming-convention
        error_description: 'Access denied for the scope "given_name"',
      };
      const partialFailureResponse = {
        status: {
          failure: true,
          statusCode: EidasStatusCodes.RESPONDER,
          statusMessage:
            '[invalid_scope]: Access denied for the scope "given_name"',
          subStatusCode: EidasSubStatusCodes.AUTHN_FAILED,
        },
      };

      // action
      const result = service.mapFailurePartialResponse(error);

      // expect
      expect(result).toStrictEqual(partialFailureResponse);
    });
  });

  describe('mapAttributes', () => {
    const getClaimsBoundedRequestedAttributesReducerMock = jest.fn();
    const mockReduceResult = { mapped: 'attributes' };
    const mockReducer = () => {
      return mockReduceResult;
    };

    beforeEach(() => {
      service[
        'getClaimsBoundedRequestedAttributesReducer'
      ] = getClaimsBoundedRequestedAttributesReducerMock.mockReturnValueOnce(
        mockReducer,
      );
    });

    it('should get the reducer bounded with the given claims', () => {
      // action
      service['mapAttributes'](claimsMock, requestedAttributesMock);

      // expect
      expect(
        getClaimsBoundedRequestedAttributesReducerMock,
      ).toHaveBeenCalledTimes(1);
      expect(
        getClaimsBoundedRequestedAttributesReducerMock,
      ).toHaveBeenCalledWith(claimsMock);
    });

    it('should return the reduce result', () => {
      // action
      const result = service['mapAttributes'](
        claimsMock,
        requestedAttributesMock,
      );

      // expect
      expect(result).toStrictEqual(mockReduceResult);
    });
  });

  describe('getClaimsBoundedRequestedAttributesReducer', () => {
    it('should bind the OidcToEidasService and the claims to the requestedAttributesReducer function', () => {
      // setup
      service['requestedAttributesReducer'] = jest.fn();
      service['requestedAttributesReducer'].bind = jest.fn();

      // action
      service['getClaimsBoundedRequestedAttributesReducer'](claimsMock);

      // expect
      expect(service['requestedAttributesReducer'].bind).toHaveBeenCalledTimes(
        1,
      );
      expect(service['requestedAttributesReducer'].bind).toHaveBeenCalledWith(
        OidcToEidasService,
        claimsMock,
      );
    });

    it('should return the requestedAttributesReducer bounded function', () => {
      // action
      const result = service['getClaimsBoundedRequestedAttributesReducer'](
        claimsMock,
      );

      // expect
      expect(result).toBeInstanceOf(Function);
    });
  });

  describe('requestedAttributesReducer', () => {
    describe('requestedAttribute is mappable', () => {
      it('should return the mapped response attribute within the given the claims and the requested attribute', () => {
        // setup
        const accumulator = {};
        const expected = { dateOfBirth: ['1962-08-24'] };

        // action
        const result = service['requestedAttributesReducer'](
          claimsMock,
          accumulator,
          EidasAttributes.DATE_OF_BIRTH,
        );

        // expect
        expect(accumulator).toStrictEqual(expected);
        expect(result).toStrictEqual(expected);
      });
    });

    describe('requestedAttribute is not mappable', () => {
      it('should return the empty accumulatormulator object', () => {
        // setup
        const accumulator = {};
        const expected = {};

        // action
        const result = service['requestedAttributesReducer'](
          claimsMock,
          accumulator,
          EidasAttributes.CURRENT_ADDRESS,
        );

        // expect
        expect(accumulator).toStrictEqual(expected);
        expect(result).toStrictEqual(expected);
      });
    });
  });
});
