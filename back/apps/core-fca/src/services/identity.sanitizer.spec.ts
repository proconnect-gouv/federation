import { ValidationError } from 'class-validator';

import { Test, TestingModule } from '@nestjs/testing';

import * as FcCommon from '@fc/common';
import { ConfigService } from '@fc/config';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata } from '@fc/oidc';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';

import { CoreFcaInvalidIdentityException } from '../exceptions';
import { NoDefaultSiretException } from '../exceptions/no-default-idp-siret.exception';
import { IdentitySanitizer } from './identity.sanitizer';

// This code make it possible to spyOn on the validateDto function
jest.mock('@fc/common', () => {
  return {
    ...jest.requireActual('@fc/common'),
  };
});

describe('IdentitySanitizer', () => {
  const loggerServiceMock = getLoggerMock();
  const validSiretMock = '81801912700021';
  const invalidSiretMock = 'invalid_siret';

  const identityMock = {
    given_name: 'given_name',
    sub: '1',
    email: 'complete@identity.fr',
    usual_name: 'usual_name',
    uid: 'uid',
    siret: validSiretMock,
  };

  const identityProviderAdapterMock = {
    getById: jest.fn(),
  };

  const idpIdMock = 'idpIdMock';

  const configServiceMock = getConfigMock();

  let service: IdentitySanitizer;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        IdentitySanitizer,
        IdentityProviderAdapterMongoService,
        ConfigService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderAdapterMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = app.get<IdentitySanitizer>(IdentitySanitizer);
  });

  describe('sanitize()', () => {
    beforeEach(() => {
      jest.spyOn(FcCommon, 'validateDto');
      identityProviderAdapterMock.getById.mockResolvedValue(identityMock);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should validate a correct identity', async () => {
      // When
      const res = await service.sanitize(identityMock, idpIdMock, []);
      // Then
      expect(res).toStrictEqual(identityMock);
    });

    it('should failed to validate an incorrect identity with missing sub', async () => {
      // Given
      const incorrectIdentityMock = { ...identityMock };
      delete incorrectIdentityMock.sub;

      await expect(
        // When
        service.sanitize(incorrectIdentityMock, idpIdMock, [
          {
            property: 'sub',
          },
        ]),
        // Then
      ).rejects.toThrow(CoreFcaInvalidIdentityException);
    });

    it('should call sanitizePhoneNumber if the phone_number is invalid', async () => {
      // Given
      jest.spyOn(service as any, 'sanitizePhoneNumber');

      const phoneValidationError: Array<ValidationError> = [
        {
          property: 'phone_number',
          constraints: { isPhoneNumber: 'Invalid phone number.' },
          value: '1234',
        },
      ];

      const invalidIdentity = {
        ...identityMock,
        phone_number: 'invalid_phone_number',
      };

      // When
      await service.sanitize(invalidIdentity, idpIdMock, phoneValidationError);

      // Then
      expect(service['sanitizePhoneNumber']).toHaveBeenCalledTimes(1);
      expect(service['sanitizePhoneNumber']).toHaveBeenCalledWith(
        invalidIdentity,
      );
    });

    it('should throw an exception if a property other than the sanitizable ones is invalid', async () => {
      // When/Then
      await expect(
        service.sanitize(identityMock, idpIdMock, [{ property: 'email' }]),
      ).rejects.toThrow(CoreFcaInvalidIdentityException);
    });

    it('should return the original identity if it passes validation', async () => {
      // Given
      const validIdentity = {
        ...identityMock,
      };
      // When
      const res = await service.sanitize(validIdentity, idpIdMock, []);
      // Then
      expect(res).toEqual(validIdentity);
    });

    it('should call sanitizeSiret() if the siret is invalid', async () => {
      // Given
      jest.spyOn(service as any, 'sanitizeSiret');

      const siretValidationError: Array<ValidationError> = [
        {
          property: 'siret',
          constraints: { isSiret: 'Invalid siret.' },
          value: invalidSiretMock,
        },
      ];

      // When
      await service.sanitize(identityMock, idpIdMock, siretValidationError);

      // Then
      expect(service['sanitizeSiret']).toHaveBeenCalledTimes(1);
      expect(service['sanitizeSiret']).toHaveBeenCalledWith(identityMock); // the return of the idp provider get
    });
  });

  describe('sanitizeSiret()', () => {
    it('should return the default siret of idp', () => {
      // When
      const res = service['sanitizeSiret']({
        siret: validSiretMock,
      } as IdentityProviderMetadata);

      // Then
      expect(res).toBe(validSiretMock);
    });

    it('should throw a NoDefaultSiretException if the idp has an empty default siret', () => {
      // Given
      identityProviderAdapterMock.getById.mockResolvedValue({
        identityMock,
        siret: '',
      });

      // Then
      expect(() => {
        service['sanitizeSiret']({
          siret: '',
        } as IdentityProviderMetadata);
      }).toThrow(NoDefaultSiretException);
    });
  });

  describe('sanitizePhoneNumber()', () => {
    it('should delete phone_number property', () => {
      // Given
      const identity = {
        ...identityMock,
        phone_number: 'wrong_phone_number',
      };
      // When
      const res = service['sanitizePhoneNumber'](identity);
      // Then
      expect(res).not.toHaveProperty('phone_number');
    });
  });
});
