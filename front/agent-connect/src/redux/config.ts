/* istanbul ignore file */
// declarative file
import storage from 'redux-persist/lib/storage';

import { REDUX_PERSIST_STORAGE_KEY } from '../constants';

const INITIAL_REDUCERS = {
  blacklist: {
    ministries: [],
    redirectURL: '',
    serviceProviderName: '',
  },
  whitelist: {
    identityProvidersHistory: [],
  },
};

export const reduxPersistConfig = {
  blacklist: Object.keys(INITIAL_REDUCERS.blacklist),
  key: REDUX_PERSIST_STORAGE_KEY,
  storage,
  whitelist: Object.keys(INITIAL_REDUCERS.whitelist),
};

export const initialState = {
  ...INITIAL_REDUCERS.blacklist,
  ...INITIAL_REDUCERS.whitelist,
};
