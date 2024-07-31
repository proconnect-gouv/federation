/* istanbul ignore file */

// declarative file
import type { AccountContextStateInterface } from '@fc/account';

import type { DashboardUserInfosInterface } from './dashboard-user-infos.interface';

export interface DashoardAccountContextState
  extends AccountContextStateInterface<DashboardUserInfosInterface> {}
