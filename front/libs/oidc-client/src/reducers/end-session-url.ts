import { Action } from '@fc/state-management';
import EVENTS from '../events';
import STATES from '../states';

const { defaultValue } = STATES.endSessionUrl;
const endSessionUrl = (state = defaultValue, { payload, type }: Action) => {
  switch (type) {
    case EVENTS.GET_END_SESSION_UPDATED:
      return payload;
    default:
      return state;
  }
};

export default endSessionUrl;
