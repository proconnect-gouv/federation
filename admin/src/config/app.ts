import { Platform } from '../utils/instance.enum';
import { IConfig } from '../interfaces';
import { parseBoolean } from '../utils/transforms';

export default {
  appName: process.env.APP_NAME || 'FC_EXPLOITATION',
  appFqdn:
    process.env.APP_FQDN || 'fc-exploitation.docker.dev-franceconnect.fr',
  environment: process.env.ENV_NAME || 'development',
  app_root: process.env.APP_ROOT || '',
  commitUrlPrefix:
    process.env.COMMITS_URL_PREFIX ||
    'https://gitlab.com/france-connect/FranceConnect/commit/',
  currentBranch: process.env.CURRENT_BRANCH || 'dev',
  latestCommitShortHash: process.env.GIT_LATEST_COMMIT_SHORT_HASH || '',
  latestCommitLongHash: process.env.GIT_LATEST_COMMIT_LONG_HASH || '',
  isProduction: process.env.IS_PRODUCTION || false,
  cipherPass: process.env.CLIENT_SECRET_CIPHER_PASS,
  appVersion: process.env.APP_VERSION || 'no-version',
  userTokenExpiresIn: 2880,
  userAuthenticationMaxAttempt: 4,
  instanceFor: process.env.IDP_CORE_INSTANCE || Platform.FCA_LOW,
  allowInsecureUrls: parseBoolean(process.env.ALLOW_INSECURE_URLS),
} as IConfig;
