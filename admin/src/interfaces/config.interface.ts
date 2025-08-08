/* istanbul ignore file */

// declarative file
import { Platform } from '../utils/instance.enum';

export type AppInstance = Platform.FCA_LOW | Platform.CL;
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
