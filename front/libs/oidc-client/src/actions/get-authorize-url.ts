import axios from 'axios';

import { ThunkActionType, ThunkDispatchType } from '@fc/state-management';
import { loadingCompleted, loadingStarted } from '@fc/loading';
import EVENTS from '../events';

export const loadGetAuthorizeUrl: ThunkActionType =
  () =>
  async (dispatch: ThunkDispatchType): Promise<any> => {
    dispatch(loadingStarted());
    const url = '/api/oidc-client/get-authorize-url';
    const { data: authorizeUrl } = await axios.get(url);
    dispatch({
      payload: authorizeUrl,
      type: EVENTS.GET_AUTHORIZE_UPDATED,
    });
    dispatch(loadingCompleted());
  };
