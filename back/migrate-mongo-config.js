//

const {
  Mongoose_DATABASE,
  Mongoose_HOSTS,
  Mongoose_PASSWORD,
  Mongoose_TLS_ALLOW_INVALID_HOST_NAME,
  Mongoose_TLS_CA_FILE,
  Mongoose_TLS_INSECURE,
  Mongoose_TLS,
  Mongoose_USER,
} = process.env;

/** @type {import('migrate-mongo').config.Config} */
const config = {
  mongodb: {
    url: `mongodb://${Mongoose_USER}:${Mongoose_PASSWORD}@${Mongoose_HOSTS}`,
    databaseName: Mongoose_DATABASE,
    options: {
      authSource: Mongoose_DATABASE,
      tls: Mongoose_TLS,
      tlsAllowInvalidCertificates: Mongoose_TLS_INSECURE,
      tlsCAFile: Mongoose_TLS_CA_FILE,
      tlsAllowInvalidHostnames: Mongoose_TLS_ALLOW_INVALID_HOST_NAME,
    },
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'changelog',

  // The mongodb collection where the lock will be created.
  lockCollectionName: 'changelog_lock',

  // The value in seconds for the TTL index that will be used for the lock. Value of 0 will disable the feature.
  lockTtl: 0,

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: '.ts',

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determin
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'esm',
};

export default config;
