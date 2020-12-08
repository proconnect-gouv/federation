import { Test, TestingModule } from '@nestjs/testing';
import { AcrValues } from '@fc/oidc';
import { EidasAttributes, EidasLevelOfAssurances } from '@fc/eidas';
import { EidasToOidcService } from './eidas-to-oidc.service';

describe('EidasToOidcService', () => {
  let service: EidasToOidcService;

  const eidasRequestMock = {
    levelOfAssurance: EidasLevelOfAssurances.SUBSTANTIAL,
    requestedAttributes: [
      EidasAttributes.PERSON_IDENTIFIER,
      EidasAttributes.CURRENT_FAMILY_NAME,
      EidasAttributes.CURRENT_GIVEN_NAME,
      EidasAttributes.DATE_OF_BIRTH,
    ],
  };

  const expectedPartialRequest = {
    // oidc parameter
    // eslint-disable-next-line @typescript-eslint/naming-convention
    acr_values: AcrValues.EIDAS2,
    scope: [
      'openid',
      'preferred_username',
      'family_name',
      'given_name',
      'birthdate',
    ],
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [EidasToOidcService],
    }).compile();

    service = module.get<EidasToOidcService>(EidasToOidcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mapRequest', () => {
    const mapScopesMock = jest.fn();

    it('should map the oidc scopes with the eidas requested attributes', () => {
      // setup
      service['mapScopes'] = mapScopesMock.mockReturnValueOnce(
        expectedPartialRequest.scope,
      );

      // action
      service.mapPartialRequest(eidasRequestMock);

      // expect
      expect(mapScopesMock).toHaveBeenCalledTimes(1);
      expect(mapScopesMock).toHaveBeenCalledWith(
        eidasRequestMock.requestedAttributes,
      );
    });

    it('should return a partial eidas request with mapped loa and attributes', () => {
      // setup
      service['mapScopes'] = mapScopesMock.mockReturnValueOnce(
        expectedPartialRequest.scope,
      );

      // action
      const result = service.mapPartialRequest(eidasRequestMock);

      // expect
      expect(result).toStrictEqual(expectedPartialRequest);
    });
  });

  describe('mapScopes', () => {
    it('should return the mapped scopes in a set for the requested attributes', () => {
      // setup
      const expectedScope = new Set<string>(expectedPartialRequest.scope);

      // action
      const result = service['mapScopes'](eidasRequestMock.requestedAttributes);

      // expect
      expect(result).toStrictEqual(expectedScope);
    });

    it('should at least have the openid scope in a set if there is no requested attribute', () => {
      // setup
      const eidasEmptyRequestedAttributesMock = [];
      const expectedScope = new Set<string>(['openid']);

      // action
      const result = service['mapScopes'](eidasEmptyRequestedAttributesMock);

      // expect
      expect(result).toStrictEqual(expectedScope);
    });
  });

  describe('requestedAttributesReducer', () => {
    it('should return the scope within a set for the given eidas attribute if it exists', () => {
      // setup
      const scopeSet = new Set<string>();
      const expected = new Set<string>(['family_name', 'preferred_username']);

      // action
      const result = service['requestedAttributesReducer'](
        scopeSet,
        EidasAttributes.CURRENT_FAMILY_NAME,
      );

      // expect
      expect(result).toStrictEqual(expected);
    });

    it('should return an empty set for the given eidas attribute if it exists', () => {
      // setup
      const scopeSet = new Set<string>();
      const expected = new Set<string>();

      // action
      const result = service['requestedAttributesReducer'](
        scopeSet,
        EidasAttributes.CURRENT_ADDRESS,
      );

      // expect
      expect(result).toStrictEqual(expected);
    });
  });
});
