import { MongooseProvider } from './mongoose.provider';

describe('MongooseProvider', () => {
  describe('connectionFactory()', () => {
    it('should exit the app if connection failing happened', () => {
      // Given
      const error = new Error('error');
      const processExit = jest
        .spyOn(process, 'exit')
        .mockImplementation((code) => code as never);

      const connectionMock = {
        on: jest.fn(),
        $initialConnection: {
          catch: jest.fn(),
        },
      };
      connectionMock.$initialConnection.catch.mockReturnValue(
        connectionMock.$initialConnection,
      );

      // When
      MongooseProvider.connectionFactory(
        { debug: jest.fn(), fatal: jest.fn() } as any,
        { publish: jest.fn() } as any,
        connectionMock as any,
      );

      const [catchFn] = connectionMock.$initialConnection.catch.mock.calls[0];
      catchFn(error);

      // Then
      expect(processExit).toHaveBeenCalledTimes(1);
    });
  });

  describe('buildMongoParams()', () => {
    it('should construct params with config options from connection name', () => {
      const params = MongooseProvider.buildMongoParams(
        undefined,
        {
          get: jest.fn().mockReturnValue({
            user: 'userValue',
            password: 'passwordValue',
            hosts: 'hostsValue',
            database: 'databaseValue',
            options: { options1: 'options1Value' },
          }),
        } as any,
        undefined,
      );
      expect(params).toStrictEqual({
        uri: 'mongodb://userValue:passwordValue@hostsValue/databaseValue',
        connectionFactory: expect.any(Function),
        options1: 'options1Value',
      });
    });
  });
});
