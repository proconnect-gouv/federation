import { PermissionsType } from '../enums';
import {
  PermissionInterface,
  RelatedEntitiesHelperGetOptionsInterface,
} from '../interfaces';
import { RelatedEntitiesHelper } from './get-related-entities-id.helper';

describe('RelatedEntitiesHelper', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('matchesOptions', () => {
    it('should return true if value is falsy', () => {
      // Given
      const optionName = 'foo' as PermissionsType;
      const optionValue = undefined;
      // When
      const result = RelatedEntitiesHelper['matchesOptions'](
        optionName,
        optionValue,
      );
      // Then
      expect(result).toBeTruthy();
    });

    it('should return true if entry has a value in optionValue', () => {
      // Given
      const optionName = 'foo' as PermissionsType;
      const optionValue = ['foo', 'bar'];

      // When
      const result = RelatedEntitiesHelper['matchesOptions'](
        optionName,
        optionValue,
      );
      // Then
      expect(result).toBeTruthy();
    });

    it('should return false if entry has a value NOT in optionValue', () => {
      // Given
      const optionName = 'notInValues' as PermissionsType;
      const optionValue = ['foo', 'bar'];

      // When
      const result = RelatedEntitiesHelper['matchesOptions'](
        optionName,
        optionValue,
      );
      // Then
      expect(result).toBeFalsy();
    });
  });

  describe('permissionFilter', () => {
    it('should return a function', () => {
      // Given
      const options = {} as RelatedEntitiesHelperGetOptionsInterface;
      // When
      const result = RelatedEntitiesHelper['permissionFilter'](options);
      // Then
      expect(typeof result).toBe('function');
    });

    it('should return a function that calls matchesOptions', () => {
      // Given
      const matchesOptionsSpy = jest.spyOn(
        RelatedEntitiesHelper,
        'matchesOptions',
      );

      const options = {
        entityType: ['foo'],
      } as unknown as RelatedEntitiesHelperGetOptionsInterface;
      const permission = {
        entity: 'entityValue',
        permissionType: 'permissionTypeValue',
      } as unknown as PermissionInterface;

      const filter = RelatedEntitiesHelper['permissionFilter'](options);
      // When
      filter(permission);
      // Then
      expect(matchesOptionsSpy).toHaveBeenCalledTimes(2);

      expect(matchesOptionsSpy).toHaveBeenNthCalledWith(
        1,
        'entityValue',
        options.entityTypes,
      );
      expect(matchesOptionsSpy).toHaveBeenNthCalledWith(
        2,
        'permissionTypeValue',
        undefined,
      );
    });

    const cases = [
      { firstReturn: true, secondReturn: true, expectedResult: true },
      { firstReturn: true, secondReturn: false, expectedResult: false },
      { firstReturn: false, secondReturn: false, expectedResult: false },
      { firstReturn: false, secondReturn: true, expectedResult: false },
    ];

    it.each(cases)(
      'should return a function that returns the union of the two calls to `matchesOptions`',
      ({ firstReturn, secondReturn, expectedResult }) => {
        // Given
        jest
          .spyOn(RelatedEntitiesHelper, 'matchesOptions')
          .mockReturnValueOnce(firstReturn)
          .mockReturnValueOnce(secondReturn);

        const options = {
          entityType: ['foo'],
        } as unknown as RelatedEntitiesHelperGetOptionsInterface;
        const permission = {} as PermissionInterface;

        const filter = RelatedEntitiesHelper['permissionFilter'](options);
        // When
        const result = filter(permission);
        // Then
        expect(result).toBe(expectedResult);
      },
    );
  });

  describe('get', () => {
    let permissions: PermissionInterface[];

    const options = {} as RelatedEntitiesHelperGetOptionsInterface;
    const arrayFilterReturn = [{ entityId: 'entityIdValue' }];
    const arrayMapReturn = ['entityIdValue'];
    const permissionFilterMock = jest.fn();

    let permissionsFilterSpy: jest.SpyInstance;
    let permissionsMapSpy: jest.SpyInstance;

    beforeEach(() => {
      permissions = [
        { entityId: 'entityIdValue' },
      ] as unknown as PermissionInterface[];

      permissionsFilterSpy = jest
        .spyOn(permissions['__proto__'], 'filter')
        .mockReturnValueOnce(arrayFilterReturn);

      jest
        .spyOn(RelatedEntitiesHelper, 'permissionFilter')
        .mockReturnValueOnce(permissionFilterMock);
    });

    it('should call Array.filter() with generated filter', () => {
      // When
      RelatedEntitiesHelper.get(permissions, options);
      // Then
      expect(permissionsFilterSpy).toHaveBeenCalledTimes(2);
      expect(permissionsFilterSpy).toHaveBeenCalledWith(permissionFilterMock);
    });

    it('should call Array.map() with result from filter', () => {
      // Given
      permissionsMapSpy = jest
        .spyOn(permissions['__proto__'], 'map')
        .mockReturnValueOnce(arrayMapReturn);

      // When
      RelatedEntitiesHelper.get(permissions, options);
      // Then
      expect(permissionsMapSpy).toHaveBeenCalledTimes(1);
      expect(permissionsMapSpy).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
