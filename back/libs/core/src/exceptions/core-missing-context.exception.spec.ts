import { CoreMissingContextException } from './core-missing-context.exception';

describe('CoreMissingContextException', () => {
  it('should construct a log property', () => {
    const param = 'paramMock';

    const exception = new CoreMissingContextException(param);
    expect(exception.log).toBe('mandatory parameter missing: paramMock');
  });
});
