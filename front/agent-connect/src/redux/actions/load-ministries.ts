import axios from 'axios';

import { ACTION_TYPES, API_DATAS_ROUTES } from '../../constants';
import { ThunkActionType, ThunkDispatchType } from '../../types';

export const loadMinistries: ThunkActionType = () => async (
  dispatch: ThunkDispatchType,
): Promise<any> => {
  dispatch({
    type: ACTION_TYPES.MINISTRY_LIST_LOAD_START,
  });
  const response = await axios.get(API_DATAS_ROUTES);
  const { data } = response;
  return dispatch({
    payload: data,
    type: ACTION_TYPES.MINISTRY_LIST_LOAD_COMPLETED,
  });
};

export default loadMinistries;
