import { Action } from '@fc/state-management';
import EVENTS from '../events';
import STATES from '../states';

const { defaultValue } = STATES.userInfos;
const userInfos = (state = defaultValue, { payload, type }: Action) => {
  switch (type) {
    case EVENTS.USER_INFOS_LOADED:
      return payload;
    default:
      return state;
  }
};

export default userInfos;
