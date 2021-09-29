import axios from 'axios';

import { ThunkActionType, ThunkDispatchType } from '@fc/state-management';
import { loadingCompleted, loadingStarted } from '@fc/loading';
import EVENTS from '../events';

export const loadUserInfos: ThunkActionType =
  () =>
  async (dispatch: ThunkDispatchType): Promise<any> => {
    dispatch(loadingStarted());
    const url = '/api/oidc-client/load-user-infos';
    const {
      data: { connected, userinfos },
    } = await axios.get(url);

    dispatch({
      payload: {
        connected,
        userinfos,
      },
      type: EVENTS.USER_INFOS_LOADED,
    });
    dispatch(loadingCompleted());
  };
