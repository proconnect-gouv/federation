import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@fc/config';
import { MongooseConfig } from './dto';

export const mongooseProvider = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const config = configService.get<MongooseConfig>('Mongoose');
    return {
      uri:
        `mongodb://${config.user}:` +
        `${config.password}@` +
        `${config.hosts}/` +
        `${config.database}` +
        `${config.options}`,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  },
});
