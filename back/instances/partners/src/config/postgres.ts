/* istanbul ignore file */

// Tested by DTO

import {
  PartnersAccount,
  PartnersAccountPermission,
  PartnersOrganisation,
  PartnersPlatform,
  PartnersServiceProvider,
  PartnersServiceProviderInstance,
  PartnersServiceProviderInstanceVersion,
} from '@entities/typeorm';

import { ConfigParser } from '@fc/config';
import { PostgresConfig } from '@fc/postgres';

const env = new ConfigParser(process.env, 'Postgres');

export default {
  type: 'postgres',
  host: env.string('HOST'),
  port: env.number('PORT'),
  database: env.string('DATABASE'),
  username: env.string('USER'),
  password: env.string('PASSWORD'),
  entities: [
    PartnersAccount,
    PartnersAccountPermission,
    PartnersOrganisation,
    PartnersPlatform,
    PartnersServiceProvider,
    PartnersServiceProviderInstance,
    PartnersServiceProviderInstanceVersion,
  ],
  synchronize: false, // do not set to true, we do not want schema automatic creation
} as PostgresConfig;
