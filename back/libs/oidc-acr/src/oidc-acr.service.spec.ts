import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { UserSession } from '@fc/core';

import { getConfigMock } from '@mocks/config';

import { OidcAcrService } from './oidc-acr.service';
import { SimplifiedInteraction } from './oidc-acr.type';

describe('OidcAcrService', () => {
  let service: OidcAcrService;

  const configServiceMock = getConfigMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OidcAcrService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<OidcAcrService>(OidcAcrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();

    configServiceMock.get.mockReturnValue({
      configuration: { acrValues: ['A', 'B'] },
    });
  });

  describe('getInteractionAcr()', () => {
    it('should return undefined if essential ACR requirement is not satisfied', () => {
      // Given
      const sessionDataMock: UserSession = {
        spEssentialAcr: 'C',
        idpAcr: 'B',
      };

      // When
      const result = service['getInteractionAcr'](sessionDataMock);

      // Then
      expect(result).toBeUndefined();
    });

    it('should return the IdP ACR if essential ACR is satisfied', () => {
      // Given
      const sessionDataMock: UserSession = {
        spEssentialAcr: 'B C',
        idpAcr: 'B',
      };

      // When
      const result = service['getInteractionAcr'](sessionDataMock);

      // Then
      expect(result).toBe('B');
    });

    it("should return 'eidas1' if IdP ACR is unsupported", () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        configuration: { acrValues: ['A', 'B'] },
      });
      const sessionDataMock: UserSession = {
        spEssentialAcr: undefined,
        idpAcr: 'C',
      };

      // When
      const result = service['getInteractionAcr'](sessionDataMock);

      // Then
      expect(result).toBe('eidas1');
    });
  });

  describe('getFilteredAcrValues()', () => {
    it('should return empty array with no requestedAcrValues provided', () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        configuration: { acrValues: ['A', 'B'] },
      });

      // When
      const result = service['getFilteredAcrValues'](undefined);

      // Then
      expect(result).toEqual([]);
    });

    it('should filter supported ACR values when given a string', () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        configuration: { acrValues: ['A', 'B'] },
      });

      const inputAcrValues = 'A C';

      // When
      const result = service['getFilteredAcrValues'](inputAcrValues);

      // Then
      expect(result).toEqual(['A']);
    });

    it('should filter supported ACR values when given an array', () => {
      // Given
      configServiceMock.get.mockReturnValueOnce({
        configuration: { acrValues: ['A', 'B'] },
      });

      const inputAcrValues = ['A', 'C'];

      // When
      const result = service['getFilteredAcrValues'](inputAcrValues);

      // Then
      expect(result).toEqual(['A']);
    });
  });

  describe('isEssentialAcrSatisfied()', () => {
    it('should return false when prompt contains essential_acr reason', () => {
      // Given
      const interactionMock = {
        prompt: {
          name: 'login',
          reasons: ['essential_acr'],
        },
      } as undefined as SimplifiedInteraction;

      // When
      const result = service['isEssentialAcrSatisfied'](interactionMock);

      // Then
      expect(result).toBe(false);
    });

    it('should return false when prompt contains essential_acrs reason', () => {
      // Given
      const interactionMock = {
        prompt: {
          name: 'login',
          reasons: ['essential_acrs'],
        },
      } as undefined as SimplifiedInteraction;

      // When
      const result = service['isEssentialAcrSatisfied'](interactionMock);

      // Then
      expect(result).toBe(false);
    });

    it('should return true when prompt does not contain essential ACR reasons', () => {
      // Given
      const interactionMock = {
        prompt: {
          name: 'interaction-check',
          reasons: ['other_reasons'],
        },
      } as undefined as SimplifiedInteraction;

      // When
      const result = service['isEssentialAcrSatisfied'](interactionMock);

      // Then
      expect(result).toBe(true);
    });
  });

  describe('getFilteredAcrParamsFromInteraction()', () => {
    it('should return acrClaims with essential single value', () => {
      // Given
      const interactionMock: SimplifiedInteraction = {
        uid: '123',
        params: {},
        prompt: {
          name: 'login',
          reasons: ['essential_acr'],
          details: {
            acr: {
              essential: true,
              value: 'A',
            },
          },
        },
      } as undefined as SimplifiedInteraction;

      jest.spyOn(service, 'getFilteredAcrValues').mockReturnValueOnce(['A']);

      // When
      const result =
        service['getFilteredAcrParamsFromInteraction'](interactionMock);

      // Then
      expect(result).toEqual({
        acrClaims: {
          essential: true,
          value: 'A',
        },
      });
    });

    it('should return acrClaims with essential multiple values', () => {
      // Given
      const interactionMock: SimplifiedInteraction = {
        uid: '123',
        params: {},
        prompt: {
          name: 'login',
          reasons: ['essential_acrs'],
          details: {
            acr: {
              essential: true,
              values: ['A', 'B'],
            },
          },
        },
      } as undefined as SimplifiedInteraction;

      jest.spyOn(service, 'getFilteredAcrValues').mockReturnValueOnce(['A']);

      // When
      const result =
        service['getFilteredAcrParamsFromInteraction'](interactionMock);

      // Then
      expect(result).toEqual({
        acrClaims: {
          essential: true,
          values: ['A'],
        },
      });
    });

    it('should return acrValues when acr_values parameter is used', () => {
      // Given
      const interactionMock: SimplifiedInteraction = {
        uid: '123',
        params: {
          acr_values: 'A B',
          client_id: '',
          redirect_uri: '',
          state: '',
          idp_hint: '',
          login_hint: '',
        },
        prompt: {
          name: 'consent',
          reasons: [],
          details: {},
        },
      };

      jest.spyOn(service, 'getFilteredAcrValues').mockReturnValueOnce(['A']);

      // When
      const result =
        service['getFilteredAcrParamsFromInteraction'](interactionMock);

      // Then
      expect(result).toEqual({
        acrValues: 'A',
      });
    });

    it('should return acrValues when none of the previous conditions are valid', () => {
      // Given
      const interactionMock: SimplifiedInteraction = {
        uid: '123',
        params: {
          client_id: '',
          redirect_uri: '',
          state: '',
          idp_hint: '',
          login_hint: '',
        },
        prompt: {
          name: 'consent',
          reasons: [],
          details: {},
        },
      };

      // When
      const result =
        service['getFilteredAcrParamsFromInteraction'](interactionMock);

      // Then
      expect(result).toEqual({});
    });
  });
});
