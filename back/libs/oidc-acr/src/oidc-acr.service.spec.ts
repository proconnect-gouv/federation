import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { OidcSession } from '@fc/oidc';

import { getConfigMock } from '@mocks/config';

import { OidcAcrService } from './oidc-acr.service';

describe('OidcAcrService', () => {
  let service: OidcAcrService;

  const configServiceMock = getConfigMock();

  const knownAcrValuesMock = {
    eidas1: 1,
    eidas2: 2,
    eidas3: 3,
  };

  const allowedAcrValuesMock = ['spAcrValue', 'idpAcrValue'];

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
      knownAcrValues: knownAcrValuesMock,
      allowedAcrValues: allowedAcrValuesMock,
    });
  });

  describe('getKnownAcrValues', () => {
    it('should return an array of known ACR values', () => {
      // Given
      const expectedKnownAcr = ['eidas1', 'eidas2', 'eidas3'];

      // when
      const result = service.getKnownAcrValues();

      // Then
      expect(result).toEqual(expectedKnownAcr);
    });
  });

  describe('isAcrValid', () => {
    it('should throw if received is lower than requested (1 vs 2)', () => {
      // Given
      const received = 'eidas1';
      const requested = 'eidas2';

      // When
      const result = service.isAcrValid(received, requested);
      // Then
      expect(result).toStrictEqual(false);
    });

    it('should throw if received is lower than requested (2 vs 3)', () => {
      // Given
      const received = 'eidas2';
      const requested = 'eidas3';

      // When
      const result = service.isAcrValid(received, requested);
      // Then
      expect(result).toStrictEqual(false);
    });

    it('should succeed if received is equal to requested for level eidas1', () => {
      // Given
      const received = 'eidas1';
      const requested = 'eidas1';

      // When
      const result = service.isAcrValid(received, requested);

      // Then
      expect(result).toStrictEqual(true);
    });

    it('should succeed if received is equal to requested for level eidas2', () => {
      // Given
      const received = 'eidas2';
      const requested = 'eidas2';

      // When
      const result = service.isAcrValid(received, requested);

      // Then
      expect(result).toStrictEqual(true);
    });

    it('should succeed if received is equal to requested for level eidas3', () => {
      // Given
      const received = 'eidas3';
      const requested = 'eidas3';

      // When
      const result = service.isAcrValid(received, requested);

      // Then
      expect(result).toStrictEqual(true);
    });

    it('should succeed if received is higher then requested (2 vs 1)', () => {
      // Given
      const received = 'eidas2';
      const requested = 'eidas1';

      // When
      const result = service.isAcrValid(received, requested);

      // Then
      expect(result).toStrictEqual(true);
    });

    it('should succeed if received is higher then requested (3 vs 2)', () => {
      // Given
      const received = 'eidas3';
      const requested = 'eidas2';

      // When
      const result = service.isAcrValid(received, requested);

      // Then
      expect(result).toStrictEqual(true);
    });
  });

  describe('getInteractionAcr()', () => {
    it('should return the idpAcr value', () => {
      // Given
      const sessionDataMock: OidcSession = {
        spAcr: 'spAcrValue',
        idpAcr: 'idpAcrValue',
      };

      // When
      const result = service['getInteractionAcr'](sessionDataMock);

      // Then
      expect(result).toBe('idpAcrValue');
    });

    it('should return the spAcr value', () => {
      // Given
      const sessionDataMock: OidcSession = {
        spAcr: 'spAcrValue',
        idpAcr: 'idpAcrValueNotAllowed',
      };

      // When
      const result = service['getInteractionAcr'](sessionDataMock);

      // Then
      expect(result).toBe('spAcrValue');
    });
  });

  describe('getAcrToAskToIdp', () => {
    // @note We do not mock getMinAcr() as it keeps the test simpler

    it('should return the sp acr value when it is higher than minimal idp acr', () => {
      // Given
      const spAcr = 'eidas2';
      const idpAllowedAcr = ['eidas1', 'eidas2', 'eidas3'];

      // When
      const result = service.getAcrToAskToIdp(spAcr, idpAllowedAcr);

      // Then
      expect(result).toBe('eidas2');
    });

    it('should return the minimal idp acr value when it is higher than sp acr', () => {
      // Given
      const spAcr = 'eidas1';
      const idpAllowedAcr = ['eidas2', 'eidas3'];

      // When
      const result = service.getAcrToAskToIdp(spAcr, idpAllowedAcr);

      // Then
      expect(result).toBe('eidas2');
    });

    it('should return the sp acr value even if the idp does not reach the sp acr', () => {
      // Given
      const spAcr = 'eidas3';
      const idpAllowedAcr = ['eidas1', 'eidas2'];

      // When
      const result = service.getAcrToAskToIdp(spAcr, idpAllowedAcr);

      // Then
      expect(result).toBe('eidas3');
    });
  });

  describe('getMinAcr', () => {
    it('should return the minimum acr value', () => {
      // Given
      const acrList = ['eidas1', 'eidas2', 'eidas3'];

      const sortedListMock = ['a', 'b', 'c'];
      service['getSortedAcrList'] = jest.fn().mockReturnValue(sortedListMock);

      // When
      const result = service['getMinAcr'](acrList);

      // Then
      expect(result).toBe('a');
    });
  });

  describe('getMaxAcr', () => {
    it('should return the maximum acr value', () => {
      // Given
      const acrList = ['eidas1', 'eidas2', 'eidas3'];

      const sortedListMock = ['a', 'b', 'c'];
      service['getSortedAcrList'] = jest.fn().mockReturnValue(sortedListMock);

      // When
      const result = service['getMaxAcr'](acrList);

      // Then
      expect(result).toBe('c');
    });
  });

  describe('getSortedAcrList', () => {
    const expectedResult = ['eidas1', 'eidas2', 'eidas3'];

    const inputs = [
      ['eidas1', 'eidas2', 'eidas3'],
      ['eidas1', 'eidas3', 'eidas2'],
      ['eidas2', 'eidas1', 'eidas3'],
      ['eidas2', 'eidas3', 'eidas1'],
      ['eidas3', 'eidas1', 'eidas2'],
      ['eidas3', 'eidas2', 'eidas1'],
    ];

    it.each(inputs)(
      'should return the sorted acr list for input %s, %s, %s',
      (...acrList) => {
        // When
        const result = service['getSortedAcrList'](acrList);

        // Then
        expect(result).toEqual(expectedResult);
      },
    );
  });
});
