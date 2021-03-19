/* istanbul ignore file */

// Tested by DTO
import { MongooseConfig } from '@fc/mongoose';
import { parseBoolean } from '@fc/common';

export default {
  user: process.env.FC_DB_USER,
  password: process.env.FC_DB_PASSWORD,
  hosts: process.env.FC_DB_HOSTS,
  database: process.env.FC_DB_DATABASE,
  options: {
    authSource: process.env.FC_DB_DATABASE,
    tls: parseBoolean(process.env.FC_DB_TLS),
    tlsInsecure: parseBoolean(process.env.FC_DB_TLS_INSECURE),
    tlsCAFile: process.env.FC_DB_TLS_CA_FILE,
    tlsAllowInvalidHostnames: parseBoolean(
      process.env.FC_DB_TLS_ALLOW_INVALID_HOST_NAME,
    ),
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
} as MongooseConfig;
