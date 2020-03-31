import { MongooseConfig } from '@fc/mongoose';

export default {
  user: process.env.FC_DB_USER,
  password: process.env.FC_DB_PASSWORD,
  hosts: process.env.FC_DB_HOSTS,
  database: process.env.FC_DB_DATABASE,
  options: process.env.FC_DB_CONNECT_OPTIONS,
} as MongooseConfig;
