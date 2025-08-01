import { readFileSync } from 'fs';
import { join, resolve } from 'path';

import { parseBoolean } from '@pc/shared/transforms/parse-boolean';

let sslConfig;

if (parseBoolean(process.env.POSTGRES_SSL)) {
  sslConfig = {
    rejectUnauthorized: parseBoolean(
      process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED,
    ),
    ca: process.env.POSTGRES_SSL_CA
      ? readFileSync(process.env.POSTGRES_SSL_CA)
      : undefined,
    key: process.env.POSTGRES_SSL_KEY
      ? readFileSync(process.env.POSTGRES_SSL_KEY)
      : undefined,
    cert: process.env.POSTGRES_SSL_CERT
      ? readFileSync(process.env.POSTGRES_SSL_CERT)
      : undefined,
  };
}

const config = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  synchronize: false, // do not set to true, we do not want schema automatic creation
  entities: [
    resolve(
      __dirname,
      '../../../shared/!(node_modules)/**/*.sql.entity{.ts,.js}',
    ),
  ],
  migrations: [join(__dirname, '../../../shared/migrations/**/*{.ts,.js}')],
  ssl: sslConfig,
};

export default config;
