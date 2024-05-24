// @NOTE refacto needed
// AppContext + useApiGet should be merged
// the `update` is not necessary and migth be outsourced inside AppContext.Consumer
import type { PropsWithChildren } from 'react';
import React, { useState } from 'react';

import type { AppContextInterface, AppContextStateInterface } from './interfaces';

export const defaultContext: AppContextStateInterface = {
  config: {},
  user: { connected: false },
};

export const AppContext = React.createContext<AppContextInterface>({
  state: defaultContext,
});

interface AppContextProviderProps extends Required<PropsWithChildren> {
  value: AppContextStateInterface | Partial<AppContextStateInterface>;
}

export const mergeState = (
  previousState: AppContextStateInterface,
  input: AppContextStateInterface | Partial<AppContextStateInterface>,
) => ({
  ...previousState,
  ...input,
});

export const AppContextProvider = ({ children, value }: AppContextProviderProps) => {
  const [state] = useState<AppContextStateInterface>(() => {
    const defaultStateValue = mergeState(defaultContext, value);
    return defaultStateValue;
  });

  return <AppContext.Provider value={{ state }}>{children}</AppContext.Provider>;
};
