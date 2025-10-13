import { resolve } from 'path';
import { parseBoolean } from '../utils/transforms/parse-boolean';

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
    resolve(__dirname, '../../../!(node_modules)/**/*.mongodb.entity{.ts,.js}'),
  ],
  tls: parseBoolean(process.env.FC_DB_TLS),
  tlsAllowInvalidCertificates: parseBoolean(process.env.FC_DB_TLS),
  tlsCAFile: process.env.FC_DB_TLS_CA_FILE,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  dbName: process.env.FC_DB_DATABASE,
};
