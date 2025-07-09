import { LocalAuthGuard } from './local.guard';

describe('LocalGuard', () => {
  let guard;

  const reqMock = {
    logIn: jest.fn(),
    session: {
      regenerate: jest.fn(),
      destroy: jest.fn(),
    },
  };

  const argumentsHostMock = {
    getRequest: jest.fn(),
  };

  const contextMock = {
    switchToHttp: jest.fn(),
  };

  /**
   * Mock the call to callback function
   * to make the promisified function resolve
   */
  const promisiableImplementation = (cb: () => void) => cb();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();

    contextMock.switchToHttp.mockReturnValue(argumentsHostMock);
    argumentsHostMock.getRequest.mockReturnValue(reqMock);
    reqMock.session.regenerate.mockImplementation(promisiableImplementation);
    reqMock.session.destroy.mockImplementation(promisiableImplementation);

    guard = new LocalAuthGuard();
  });

  describe('canActivate', () => {
    it('should regenerate session', async () => {
      const canActivateResult = true;
      guard.wrappedSuperCanActivate = jest
        .fn()
        .mockResolvedValue(canActivateResult);
      // When
      await guard.canActivate(contextMock);
      // Then
      expect(reqMock.session.regenerate).toHaveBeenCalledTimes(1);
    });
  });

  it('should not regenerate session', async () => {
    const canActivateResult = false;
    guard.wrappedSuperCanActivate = jest
      .fn()
      .mockResolvedValue(canActivateResult);
    // When
    await guard.canActivate(contextMock);
    // Then
    expect(reqMock.session.regenerate).toHaveBeenCalledTimes(0);
  });
});
