import { Action } from '@fc/state-management';
import { Events } from '../events';
import { LoadingStates } from '../states';

const { defaultValue } = LoadingStates.loading;
export const loading = (state = defaultValue, { type }: Action) => {
  switch (type) {
    case Events.LOADING_STARTED:
      return true;
    case Events.LOADING_COMPLETED:
      return false;
    default:
      return state;
  }
};
