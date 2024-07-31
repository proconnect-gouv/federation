/* istanbul ignore file */

// declarative file
import type { UserInfosInterface } from './user-infos.interface';

export interface AccountContextStateInterface<U extends UserInfosInterface = UserInfosInterface> {
  connected: boolean;
  ready: boolean;
  expired: boolean;
  userinfos: U | undefined;
}
