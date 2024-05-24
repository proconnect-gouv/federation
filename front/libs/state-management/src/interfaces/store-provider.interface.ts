/* istanbul ignore file */

// declarative file
import type { PropsWithChildren } from 'react';
import type { ReducersMapObject } from 'redux';

import type { GlobalState } from './global-state.interface';

export interface StoreProviderProps<S extends GlobalState> extends Required<PropsWithChildren> {
  debugMode: boolean;
  middlewares: Function[];
  persistKey: string;
  reducers: ReducersMapObject;
  states: S;
}
