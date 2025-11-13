import { CoreFcaAgentNoIdpException } from './core-fca-no-idp.exception';

describe('CoreFcaAgentNoIdpException', () => {
  describe('constructor', () => {
    it('should use default properties', () => {
      const result = new CoreFcaAgentNoIdpException(undefined, '');

      expect(result['spName']).toEqual('le service');
    });
  });
});
