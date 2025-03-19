import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { Session } from '@fc/session';

import { getConfigMock } from '@mocks/config';

import { OidcAcrService } from './oidc-acr.service';

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
    it('should return the idpAcr value', () => {
      // Given
      const sessionDataMock: Session = {
        spAcr: 'A',
        idpAcr: 'B',
      };

      // When
      const result = service['getInteractionAcr'](sessionDataMock);

      // Then
      expect(result).toBe('B');
    });

    it('should return the default acr value', () => {
      // Given
      const sessionDataMock: Session = {
        spAcr: 'A',
      };

      // When
      const result = service['getInteractionAcr'](sessionDataMock);

      // Then
      expect(result).toBe('eidas1');
    });
  });

  describe('getFilteredAcrValues()', () => {
    it('should return valid acr values when intersection exists', () => {
      // Given
      configServiceMock.get.mockReturnValue({
        configuration: { acrValues: ['A', 'B', 'C'] },
      });
      const requestedAcrValues = 'A C';

      // When
      const result = service.getFilteredAcrValues(requestedAcrValues);

      // Then
      expect(result).toBe('A C');
    });

    it('should return an empty string when there is no intersection', () => {
      // Given
      configServiceMock.get.mockReturnValue({
        configuration: { acrValues: ['A', 'B', 'C'] },
      });
      const requestedAcrValues = 'D E';

      // When
      const result = service.getFilteredAcrValues(requestedAcrValues);

      // Then
      expect(result).toBe('');
    });

    it('should return an empty string when requestedAcrValues is undefined', () => {
      // Given
      configServiceMock.get.mockReturnValue({
        configuration: { acrValues: ['A', 'B', 'C'] },
      });

      // When
      const result = service.getFilteredAcrValues(undefined);

      // Then
      expect(result).toBe('');
    });
  });
});
