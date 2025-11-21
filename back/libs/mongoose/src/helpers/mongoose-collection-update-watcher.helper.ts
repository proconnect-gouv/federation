import { debounce, type DebouncedFunc } from 'lodash';
import { type ChangeStream, ChangeStreamDocument } from 'mongodb';
import { Document, Model } from 'mongoose';

import { Injectable, type OnModuleDestroy } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';

import type { MongooseConfig } from '../dto';

const DEFAULT_OPERATIONS = ['insert', 'update', 'delete', 'rename', 'replace'];

@Injectable()
export class MongooseCollectionOperationWatcherHelper
  implements OnModuleDestroy
{
  private static listeners: {
    callback: DebouncedFunc<any>;
    model: Model<any>;
    watch: ChangeStream<any, any>;
  }[] = [];

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  watchWith<T extends Document>(model: Model<T>, callback: Function): void {
    const waitDuration =
      this.config.get<MongooseConfig>('Mongoose').watcherDebounceWaitDuration;
    const debouncedCallback = debounce(callback as any, waitDuration);
    MongooseCollectionOperationWatcherHelper.listeners.push({
      model,
      callback: debouncedCallback,
      watch: this.watch<T>(model, debouncedCallback),
    });
  }

  private watch<T extends Document>(model: Model<T>, callback: Function) {
    const watch = model.watch();
    this.logger.info(
      `Database OperationType watcher initialization for "${model.modelName}".`,
    );

    watch.on(
      'change',
      this.operationTypeWatcher.bind(this, model.modelName, callback),
    );
    return watch;
  }

  async connectAllWatchers() {
    for (const listener of MongooseCollectionOperationWatcherHelper.listeners) {
      const { model, callback, watch: oldWatch } = listener;

      await oldWatch.close();
      listener.watch = this.watch(model, callback);
    }
  }
  disconnectAllWatchers() {
    return Promise.all(
      MongooseCollectionOperationWatcherHelper.listeners.map(
        async function disconnectWatcher({ watch, callback }) {
          callback.cancel();
          await watch.close();
        },
      ),
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

  async onModuleDestroy() {
    this.logger.debug('Closing all ChangeStreams');

    await this.disconnectAllWatchers();

    MongooseCollectionOperationWatcherHelper.listeners = [];
  }
}
