/* istanbul ignore file */

// Declarative code
import * as mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@fc/config';
import { MongooseConfig } from './dto';

/**
 * Prevent depreciation warning
 */
mongoose.set('useCreateIndex', true);

export const mongooseProvider = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const { user, password, hosts, database, options } = config.get<
      MongooseConfig
    >('Mongoose');
    return {
      uri:
        `mongodb://${user}:` +
        `${password}@` +
        `${hosts}/` +
        `${database}` +
        `${options}`,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  },
});
