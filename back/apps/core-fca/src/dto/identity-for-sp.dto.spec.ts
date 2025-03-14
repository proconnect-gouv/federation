import { ClassTransformOptions } from 'class-transformer';
import { ValidatorOptions } from 'class-validator';

import { validateDto } from '@fc/common';

import { IdentityForSpDto } from './identity-for-sp.dto';

describe('IdentityForSpDto', () => {
  const validSiretMock = '81801912700021';

  const identityMock = {
    given_name: 'given_name',
    sub: '1',
    email: 'complete@identity.fr',
    usual_name: 'usual_name',
    uid: 'uid',
    siret: validSiretMock,
  };

  const validatorOptions: ValidatorOptions = {
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    whitelist: true,
  };

  const transformOptions: ClassTransformOptions = {
    excludeExtraneousValues: true,
  };

  describe('validation succeeds', () => {
    it('should validate a correct identity', async () => {
      // When
      const result = await validateDto(
        identityMock,
        IdentityForSpDto,
        validatorOptions,
        transformOptions,
      );

      // Then
      expect([]).toStrictEqual(result);
    });

    it('should success when organizational_unit contains points and others specifics characters', async () => {
      // Given
      const organizationalUnitIdentity = {
        ...identityMock,
        organizational_unit:
          'MINISTERE INTERIEUR/DGPN/US REGROUPEMENT DES DZPN/US REGROUP. DIPN GC/DIPN77/CPN MELUN VAL DE SEINE',
      };

      // When
      const result = await validateDto(
        organizationalUnitIdentity,
        IdentityForSpDto,
        validatorOptions,
        transformOptions,
      );

      // Then
      expect([]).toStrictEqual(result);
    });

    it('should validate a correct identity with custom field', async () => {
      // Given
      const customIdentity = {
        ...identityMock,
        custom: { unknown: 'custom-data' },
      };

      const result = await validateDto(
        customIdentity,
        IdentityForSpDto,
        validatorOptions,
        transformOptions,
      );

      // Then
      expect([]).toStrictEqual(result);
    });

    it('should validate a correct identity with optional fields', async () => {
      const optionalIdentity = {
        ...identityMock,
        anUnknownPropety: 'there is no validation for this property',
      };

      const result = await validateDto(
        optionalIdentity,
        IdentityForSpDto,
        validatorOptions,
        transformOptions,
      );

      // Then
      expect([]).toStrictEqual(result);
    });
  });
});
