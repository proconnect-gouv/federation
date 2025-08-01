import { resolve } from 'path';
import * as fs from 'fs';
import { parseBoolean } from '@pc/shared/transforms/parse-boolean';

export = {
  type: process.env.FC_DB_TYPE || 'mongodb',
  url:
    'mongodb://' +
    `${encodeURIComponent(process.env.FC_DB_USER || 'fcApp')}:` +
    `${encodeURIComponent(process.env.FC_DB_PASSWORD || 'pass')}@` +
    `${process.env.FC_DB_HOSTS || 'localhost:27017'}/` +
    `${process.env.FC_DB_DATABASE || 'fc'}` +
    `${process.env.FC_DB_CONNECT_OPTIONS || ''}`,
  synchronize: (process.env.FC_DB_SYNCHRONIZE || 'false') === 'true',
  entities: [
    resolve(__dirname, '../**/*.mongodb.entity{.ts,.js}'),
    resolve(
      __dirname,
      '../../../shared/!(node_modules)/**/*.mongodb.entity{.ts,.js}',
    ),
  ],
  ssl: parseBoolean(process.env.FC_DB_TLS),
  sslValidate: parseBoolean(process.env.FC_DB_TLS),
  sslCA: process.env.FC_DB_TLS_CA_FILE
    ? fs.readFileSync(process.env.FC_DB_TLS_CA_FILE)
    : undefined,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  dbName: process.env.FC_DB_DATABASE,
};
