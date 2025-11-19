import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { MongooseConnectionDisconnectedEvent } from '../events';
import { MongooseCollectionOperationWatcherHelper } from '../helpers/mongoose-collection-update-watcher.helper';

@EventsHandler(MongooseConnectionDisconnectedEvent)
export class MongooseConnectionDisconnectedHandler
  implements IEventHandler<MongooseConnectionDisconnectedEvent>
{
  constructor(
    private readonly mongooseHelper: MongooseCollectionOperationWatcherHelper,
  ) {}

  public async handle() {
    await this.mongooseHelper.disconnectAllWatchers();
  }
}
