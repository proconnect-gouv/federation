import { Action } from '@fc/state-management';
import EVENTS from '../events';
import STATES from '../states';

const { defaultValue } = STATES.authorizeUrl;
const authorizeUrl = (state = defaultValue, { payload, type }: Action) => {
  switch (type) {
    case EVENTS.GET_AUTHORIZE_UPDATED:
      return payload;
    default:
      return state;
  }
};

export default authorizeUrl;
