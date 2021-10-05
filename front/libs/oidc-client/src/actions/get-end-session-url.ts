import axios from 'axios';

import { ThunkActionType, ThunkDispatchType } from '@fc/state-management';
import { loadingCompleted, loadingStarted } from '@fc/loading';
import EVENTS from '../events';

export const loadGetEndSessionUrl: ThunkActionType =
  () =>
  async (dispatch: ThunkDispatchType): Promise<void> => {
    dispatch(loadingStarted());
    const url = '/api/oidc-client/get-end-session-url';
    const { data: endSessionUrl } = await axios.get(url);
    dispatch({
      payload: endSessionUrl,
      type: EVENTS.GET_END_SESSION_UPDATED,
    });
    dispatch(loadingCompleted());
  };
