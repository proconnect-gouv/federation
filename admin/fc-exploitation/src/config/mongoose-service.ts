import { Injectable } from '@nestjs/common';
import { parseBoolean } from '@fc/shared/transforms/parse-boolean';

import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import { ConfigService } from 'nestjs-config';

@Injectable()
export class MongoService implements MongooseOptionsFactory {
  constructor(private readonly config: ConfigService) {}
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.config.get('mongo-database').url,
      authSource: process.env.FC_DB_DATABASE,
      tls: parseBoolean(process.env.FC_DB_TLS),
      tlsInsecure: parseBoolean(process.env.FC_DB_TLS_INSECURE),
      tlsCAFile: process.env.FC_DB_TLS_CA_FILE,
      tlsAllowInvalidHostnames: process.env.FC_DB_TLS_ALLOW_INVALID_HOST_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }
}
