import { CoreFcaInvalidIdentityException } from './core-fca-invalid-identity.exception';

describe('CoreFcaInvalidIdentityException', () => {
  describe('constructor', () => {
    it('should set properties', () => {
      // Given
      const contact = 'contact@email.fr';
      const validationConstraints = 'Une erreur de validation';
      const validationTarget = '{email: "myemail@mail.fr"}';

      // When
      const result = new CoreFcaInvalidIdentityException(
        contact,
        validationConstraints,
        validationTarget,
      );

      // Then
      expect(result.contact).toBe(contact);
      expect(result.validationConstraints).toBe(validationConstraints);
      expect(result.validationTarget).toBe(validationTarget);
    });

    it('should set default properties', () => {
      // Given
      const contact = 'contact@email.fr';

      // When
      const result = new CoreFcaInvalidIdentityException(contact);

      // Then
      expect(result.contact).toBe(contact);
      expect(result.validationConstraints).toBe(
        'Les champs en erreur ne sont pas connus.',
      );
      expect(result.validationTarget).toBe('');
    });
  });
});
