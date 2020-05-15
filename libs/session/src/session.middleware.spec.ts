import { SessionMiddleware } from './session.middleware';

describe('SessionMiddleware', () => {
  let service: SessionMiddleware;

  const configMock: any = {
    get: jest.fn(),
  };

  const configResultMock = {
    secret: "The tooth fairy isn't real",
    name: 'SarahConnor',
    ttl: 42,
  };

  const sessionMock = jest.fn();

  const middlewareResultMock = Symbol('middlewareResultMockValue');
  const sessionProxyMockReturnValue = jest.fn();

  SessionMiddleware.sessionProxy = sessionMock;

  beforeEach(async () => {
    jest.resetAllMocks();

    configMock.get.mockReturnValue(configResultMock);
    sessionMock.mockReturnValue(sessionProxyMockReturnValue);
    sessionProxyMockReturnValue.mockReturnValue(middlewareResultMock);

    service = new SessionMiddleware(configMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should call session with variables from config', () => {
      // Then
      expect(sessionMock).toHaveBeenCalledTimes(1);
    });
  });
  describe('use', () => {
    it('should return the middleware', () => {
      // Given
      const reqMock = {};
      const resMock = {};
      const nextMock: any = {};
      // When
      const result = service.use(reqMock, resMock, nextMock);
      // Then
      expect(result).toBe(middlewareResultMock);
    });
  });
});
