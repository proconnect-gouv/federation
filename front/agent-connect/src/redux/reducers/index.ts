/* istanbul ignore file */

// declarative file
import { combineReducers, Reducer } from 'redux';

import identityProvidersHistory from './identity-providers-history';
import ministries from './ministries';
import redirectToIdentityProviderInputs from './redirect-to-identity-provider-inputs';
import redirectURL from './redirect-url';
import serviceProviderName from './service-provider-name';

function createRootReducer(): Reducer {
  return combineReducers({
    identityProvidersHistory,
    ministries,
    redirectToIdentityProviderInputs,
    redirectURL,
    serviceProviderName,
  });
}

export default createRootReducer;
