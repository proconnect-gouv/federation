import { validateDto } from '@fc/common';
import { validationOptions } from '@fc/config';
import { OidcClientConfig } from './oidc-client-config.dto';

describe('OidcClientConfig', () => {
  const correctObjectMock = {
    providers: [],
    reloadConfigDelayInMs: 1000,
  };

  describe('global validation', () => {
    it('should validate correctObjectMock', async () => {
      // When
      const errors = await validateDto(
        correctObjectMock,
        OidcClientConfig,
        validationOptions,
      );
      // Then
      expect(errors).toEqual([]);
    });
  });

  describe('reloadConfigDelayInMs', () => {
    it('should accept only numbers', async () => {
      // Given
      const objectMock = {
        ...correctObjectMock,
        reloadConfigDelayInMs: 'foo',
      };
      // When
      const errors = await validateDto(
        objectMock,
        OidcClientConfig,
        validationOptions,
      );
      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('reloadConfigDelayInMs');
    });
  });
});
