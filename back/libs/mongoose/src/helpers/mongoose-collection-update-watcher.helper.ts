import { debounce } from 'lodash';
import { ChangeStreamDocument } from 'mongodb';
import { Document, Model } from 'mongoose';

import { Injectable } from '@nestjs/common';

import { LoggerService } from '@fc/logger';

const DEFAULT_OPERATIONS = ['insert', 'update', 'delete', 'rename', 'replace'];

@Injectable()
export class MongooseCollectionOperationWatcherHelper {
  private static listeners = [];

  constructor(private readonly logger: LoggerService) {}

  watchWith<T extends Document>(model: Model<T>, callback: Function): void {
    const debouncedCallback = debounce(callback as any, 1000);
    MongooseCollectionOperationWatcherHelper.listeners.push({
      model,
      callback: debouncedCallback,
    });
    this.watch<T>(model, debouncedCallback);
  }

  private watch<T extends Document>(model: Model<T>, callback: Function): void {
    const watch = model.watch();
    this.logger.info(
      `Database OperationType watcher initialization for "${model.modelName}".`,
    );

    watch.on(
      'change',
      this.operationTypeWatcher.bind(this, model.modelName, callback),
    );
  }

  connectAllWatchers() {
    MongooseCollectionOperationWatcherHelper.listeners.forEach(
      ({ model, callback }) => this.watch(model, callback),
    );
  }

  private operationTypeWatcher(
    modelName: string,
    callback: Function,
    stream: ChangeStreamDocument,
  ): void {
    const isListenedOperation = DEFAULT_OPERATIONS.includes(
      stream.operationType,
    );

    if (isListenedOperation) {
      this.logger.info(
        `Detected "${stream.operationType}" on "${modelName}", calling handler.`,
      );
      callback();
      return;
    }

    this.logger.debug(
      `Detected "${stream.operationType}" on "${modelName}", Ignoring.`,
    );
  }
}
