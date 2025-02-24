import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { Test, TestingModule } from '@nestjs/testing';

import * as FcCommon from '@fc/common';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';

import { getLoggerMock } from '@mocks/logger';

import { IdentityForSpDto } from '../dto';
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

  let service: IdentitySanitizer;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        IdentitySanitizer,
        IdentityProviderAdapterMongoService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderAdapterMock)
      .compile();

    service = app.get<IdentitySanitizer>(IdentitySanitizer);
  });

  describe('sanitize()', () => {
    beforeEach(() => {
      jest.spyOn(FcCommon, 'validateDto');
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should validate a correct identity', async () => {
      // When
      const res = await service.sanitize(identityMock, idpIdMock);
      // Then
      expect(res).toBe(identityMock);
    });

    it('should validate the IdentityFromIdpDto with correct params', async () => {
      // When
      await service.sanitize(identityMock, idpIdMock);
      // Then
      expect(FcCommon.validateDto).toHaveBeenCalledTimes(1);
      expect(FcCommon.validateDto).toHaveBeenCalledWith(
        identityMock,
        IdentityForSpDto,
        {
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
          whitelist: true,
        },
        { excludeExtraneousValues: true },
      );
    });

    it('should failed to validate an incorrect identity with missing sub', async () => {
      // Given
      const incorrectIdentityMock = { ...identityMock };
      delete incorrectIdentityMock.sub;
      await expect(
        // When
        service.sanitize(incorrectIdentityMock, idpIdMock),
        // Then
      ).rejects.toThrow(CoreFcaInvalidIdentityException);
    });

    it('should throw when email is a string of number', async () => {
      const emailIdentity = {
        email: '12345',
      };
      const identityForSpDto = plainToInstance(IdentityForSpDto, emailIdentity);
      const errors = await validate(identityForSpDto, {
        skipMissingProperties: true,
      });
      expect(errors.length).not.toBe(0);
      expect(errors[0].constraints.isEmail).toContain(`email must be an email`);
    });

    it('should delete phone_number claim if the phone_number is invalid', async () => {
      // Given
      const invalidIdentity = {
        ...identityMock,
        phone_number: 'invalid_phone',
      };
      // When
      const res = await service.sanitize(invalidIdentity, idpIdMock);
      // Then
      expect(res).not.toHaveProperty('phone_number');
    });

    it('should return a transformed identity if only phone_number is invalid', async () => {
      // Given
      const invalidIdentity = {
        ...identityMock,
        phone_number: 'invalid_phone',
      };
      // When
      const res = await service.sanitize(invalidIdentity, idpIdMock);
      // Then
      expect(res).toEqual({ ...identityMock, phone_number: undefined });
    });

    it('should throw an exception if a property other than the sanitizable one is invalid', async () => {
      // Given
      const invalidIdentity = {
        ...identityMock,
        email: 'invalid-email', // Invalid field
      };
      // When/Then
      await expect(
        service.sanitize(invalidIdentity, idpIdMock),
      ).rejects.toThrow(CoreFcaInvalidIdentityException);
    });

    it('should return the original identity if it passes validation', async () => {
      // Given
      const validIdentity = {
        ...identityMock,
      };
      // When
      const res = await service.sanitize(validIdentity, idpIdMock);
      // Then
      expect(res).toEqual(validIdentity);
    });

    it('should success when organizational_unit contains points and others specifics characters', async () => {
      const organizationalUnitIdentity = {
        organizational_unit:
          'MINISTERE INTERIEUR/DGPN/US REGROUPEMENT DES DZPN/US REGROUP. DIPN GC/DIPN77/CPN MELUN VAL DE SEINE',
      };
      const identityForSpDto = plainToInstance(
        IdentityForSpDto,
        organizationalUnitIdentity,
      );
      const errors = await validate(identityForSpDto, {
        skipMissingProperties: true,
      });
      expect(errors.length).toBe(0);
    });

    it('should fail if siren is empty string', async () => {
      const sirenIdentity = {
        siren: '',
      };
      const identityForSpDto = plainToInstance(IdentityForSpDto, sirenIdentity);
      const errors = await validate(identityForSpDto, {
        skipMissingProperties: true,
      });
      expect(errors.length).not.toBe(0);
      expect(errors[0].constraints.minLength).toContain(
        `siren must be longer than or equal to 1 characters`,
      );
    });

    it('should failed if siret is empty string', async () => {
      const sirenIdentity = {
        siret: '',
      };
      const identityForSpDto = plainToInstance(IdentityForSpDto, sirenIdentity);
      const errors = await validate(identityForSpDto, {
        skipMissingProperties: true,
      });
      expect(errors.length).not.toBe(0);
      expect(errors[0].constraints.isSiret).toContain(`Le siret est invalide.`);
    });

    it('should failed if siret is not a string', async () => {
      const siretIdentity = {
        siret: 1234,
      };
      const identityForSpDto = plainToInstance(IdentityForSpDto, siretIdentity);
      const errors = await validate(identityForSpDto, {
        skipMissingProperties: true,
      });
      expect(errors.length).not.toBe(0);
      expect(errors[0].constraints.isSiret).toContain(`Le siret est invalide.`);
    });

    it('should failed if siret is an empty property', async () => {
      const { siret: _, ...identityWihoutSiret } = identityMock;

      const identityForSpDto = plainToInstance(
        IdentityForSpDto,
        identityWihoutSiret,
      );

      const errors = await validate(identityForSpDto);
      expect(errors.length).not.toBe(0);
      expect(errors[0].constraints.isSiret).toContain(`Le siret est invalide.`);
    });

    it('should validate an identity with custom properties', async () => {
      // Given
      const identityMockWithCustomProperties = {
        ...identityMock,
        unknownField: 'a custom field',
        anotherField: 'another custom field',
      };
      // When
      const res = await service.sanitize(
        identityMockWithCustomProperties,
        idpIdMock,
      );
      // Then
      expect(FcCommon.validateDto).toHaveBeenCalledTimes(1);
      expect(FcCommon.validateDto).toHaveBeenCalledWith(
        identityMockWithCustomProperties,
        IdentityForSpDto,
        {
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
          whitelist: true,
        },
        { excludeExtraneousValues: true },
      );
      expect(res).toBe(identityMockWithCustomProperties);
    });
  });

  describe('handleErrors()', () => {
    it('should log that identity is invalid', async () => {
      // Given
      const errors = [{ property: 'sub' }];

      // When
      await expect(
        service['handleErrors'](errors, identityMock, idpIdMock),
      ).rejects.toThrow(CoreFcaInvalidIdentityException);

      // Then
      expect(loggerServiceMock.debug).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.debug).toHaveBeenCalledWith(
        errors,
        `Identity from "${idpIdMock}" is invalid`,
      );
    });

    it('should throw an exception if there is an error on a non sanitizable property', async () => {
      // Given
      const errors = [{ property: 'sub' }];

      // When & Then
      await expect(
        service['handleErrors'](errors, identityMock, idpIdMock),
      ).rejects.toThrow(CoreFcaInvalidIdentityException);
    });

    it('should remove property if there is an error on phone_number', async () => {
      // Given
      const errors = [{ property: 'phone_number' }];

      // When
      const res = await service['handleErrors'](
        errors,
        identityMock,
        idpIdMock,
      );

      // Then
      expect(res).not.toHaveProperty('phone_number');
    });

    it('should call sanitizeSiret() if there is an error on siret', async () => {
      // Given
      const errors = [{ property: 'siret' }];
      service['sanitizeSiret'] = jest.fn();

      // When
      await service['handleErrors'](errors, identityMock, idpIdMock);

      // Then
      expect(service['sanitizeSiret']).toHaveBeenCalledTimes(1);
      expect(service['sanitizeSiret']).toHaveBeenCalledWith(
        { property: 'siret' },
        idpIdMock,
      );
    });
  });

  describe('sanitizeSiret()', () => {
    it('should return the default siret of idp', async () => {
      // When
      identityProviderAdapterMock.getById.mockResolvedValue({
        ...identityMock,
        siret: validSiretMock,
      });
      const res = await service['sanitizeSiret']({}, idpIdMock);

      // Then
      expect(res).toBe(validSiretMock);
    });

    it('should throw a NoDefaultSiretException if the idp has an empty default siret', async () => {
      // When
      identityProviderAdapterMock.getById.mockResolvedValue({
        identityMock,
        siret: '',
      });

      // Then && When
      await expect(service['sanitizeSiret']({}, idpIdMock)).rejects.toThrow(
        NoDefaultSiretException,
      );
    });
  });
});
