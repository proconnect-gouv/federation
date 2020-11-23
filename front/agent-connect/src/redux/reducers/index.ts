/* istanbul ignore file */
// declarative file
import { combineReducers, Reducer } from 'redux';

import identityProvidersHistory from './identity-providers-history';
import ministries from './ministries';
import redirectURL from './redirect-url';
import serviceProviderName from './service-provider-name';

function createRootReducer(): Reducer {
  return combineReducers({
    identityProvidersHistory,
    ministries,
    redirectURL,
    serviceProviderName,
  });
}

export default createRootReducer;
