import * as mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@fc/config';
import { MongooseConfig } from './dto';

/**
 * Prevent use of depreciated index management
 * @see https://mongoosejs.com/docs/deprecations.html#ensureindex
 */
mongoose.set('useCreateIndex', true);

export const mongooseProvider = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: buildFactoryParams,
});

export function buildConnectionString(config: ConfigService) {
  const { user, password, hosts, database } =
    config.get<MongooseConfig>('Mongoose');

  return `mongodb://${user}:` + `${password}@` + `${hosts}/` + `${database}`;
}

export function buildFactoryParams(config: ConfigService) {
  const uri = buildConnectionString(config);
  const { options } = config.get<MongooseConfig>('Mongoose');

  return { uri, ...options };
}
