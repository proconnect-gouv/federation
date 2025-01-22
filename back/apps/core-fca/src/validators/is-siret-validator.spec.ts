import { IsSiretConstraint } from './is-siret-validator';

const constraint = new IsSiretConstraint();

describe('IsSiretValidator', () => {
  describe('validate', () => {
    it('should validate the siret of la poste', () => {
      expect(constraint.validate('35600000012345')).toBeTrue();
    });

    it('should validate a string number of 14 figures without empty spaces', () => {
      expect(constraint.validate('81801912700021')).toBeTrue();
    });

    it('should not validate a lunh compliant string number of 13 figures', () => {
      expect(constraint.validate('5521005540026')).toBeFalse();
    });

    it('should validate a string number of 14 figues with spaces', () => {
      expect(constraint.validate('5521 0055 400 260')).toBeTrue();
    });

    it('should not validate a string with more than 14 figures', () => {
      expect(constraint.validate('5521 0055 400 260 0')).toBeFalse();
    });

    it('should not validate a string number of more than 14 figures without empty spaces', () => {
      expect(constraint.validate('55210055400260000')).toBeFalse();
    });

    it('should not validate a string even of 14 characters', () => {
      expect(constraint.validate('imnotavalidint')).toBeFalse();
    });
  });

  describe('luhnChecksum', () => {
    it('should return the luhn checksum of a string', () => {
      expect(constraint['luhnChecksum']('1111')).toBe(6);
    });

    it('should return the luhn checksum of a string', () => {
      expect(constraint['luhnChecksum']('123')).toBe(8);
    });

    it('should return the luhn checksum of a string', () => {
      expect(constraint['luhnChecksum']('8763')).toBe(20);
    });

    it('should return the luhn checksum of a string', () => {
      expect(constraint['luhnChecksum']('5521005540026')).toBe(30);
    });
  });

  describe('defaultMessage', () => {
    it('should return specific message if siret is invalid', () => {
      expect(constraint.defaultMessage()).toEqual('Le siret est invalide.');
    });
  });
});
