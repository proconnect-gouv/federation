import { CoreFcaUnauthorizedEmailException } from './core-fca-unauthorized-email.exception';

describe('CoreFcaUnauthorizedEmailException', () => {
  describe('constructor', () => {
    it('should use default properties', () => {
      const result = new CoreFcaUnauthorizedEmailException('', '');

      expect(result['description']).toContain('✅ \n❌ gmail, yahoo, orange');
    });
  });
});
