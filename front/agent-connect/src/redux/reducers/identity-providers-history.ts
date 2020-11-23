import { ACTION_TYPES } from '../../constants';
import {
  addIdentityProvider,
  filterIdentityProvidersHistoryByLoadedMinistries,
  removeIdentityProvider,
} from './helpers';

const identityProvidersHistory = (
  state: string[] | undefined = [],
  action: any,
) => {
  switch (action.type) {
    case ACTION_TYPES.IDENTITY_PROVIDER_ADD:
      return addIdentityProvider(state, action.payload);
    case ACTION_TYPES.IDENTITY_PROVIDER_REMOVE:
      return removeIdentityProvider(state, action.payload);
    case ACTION_TYPES.MINISTRY_LIST_LOAD_COMPLETED:
      return filterIdentityProvidersHistoryByLoadedMinistries(
        state,
        action.payload.ministries,
      );
    default:
      return state;
  }
};

export default identityProvidersHistory;
