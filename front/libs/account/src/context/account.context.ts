/* istanbul ignore file */

// declarative file
import React from 'react';

import type { AccountContextStateInterface } from '../interfaces';

export const AccountContext = React.createContext<AccountContextStateInterface | undefined>(
  undefined,
);

AccountContext.displayName = 'AccountContext';
