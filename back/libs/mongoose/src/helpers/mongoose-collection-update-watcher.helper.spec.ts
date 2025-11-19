import { ChangeStreamDocument } from 'mongodb';

import { getLoggerMock } from '@mocks/logger';

import { MongooseCollectionOperationWatcherHelper } from './mongoose-collection-update-watcher.helper';

describe('MongooseCollectionOperationWatcherHelper', () => {
  describe('operationTypeWatcher', () => {
    it('should log a notice when operationTypeWatcher is called with a bad operationType', () => {
      // Given
      const callbackMock = jest.fn();
      const modelNameMock = 'modelMockedName';
      const streamMock = {
        operationType: 'wrong',
      } as unknown as ChangeStreamDocument;
      const loggerServiceMock = getLoggerMock();
      const service = new MongooseCollectionOperationWatcherHelper(
        loggerServiceMock,
        {} as any,
      );

      // When
      service['operationTypeWatcher'](modelNameMock, callbackMock, streamMock);

      // Then
      expect(loggerServiceMock.debug).toHaveBeenCalled();
    });
  });
});
