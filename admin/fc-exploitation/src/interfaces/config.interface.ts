/* istanbul ignore file */

// declarative file
import { Platform } from '@fc/shared/utils';

export type AppInstance = Platform.FCA_LOW | Platform.FCP_HIGH | Platform.CL;
export interface IConfig {
  appName: string;
  appFqdn: string;
  environment: string;
  app_root: string;
  commitUrlPrefix: string;
  currentBranch: string;
  latestCommitShortHash: string;
  latestCommitLongHash: string;
  isProduction: boolean;
  cipherPass: string;
  appVersion: string;
  userTokenExpiresIn: number;
  userAuthenticationMaxAttempt: number;
  instanceFor: AppInstance;
}
