/* istanbul ignore file */
// @TODO tests with not mocked api call
import { ACTION_TYPES } from '../../constants';
import MOCK_IDP_FROM_BACKEND from '../../mocks/api-data.mock.json';
import { ThunkActionType } from '../../types';

/**
 * @todo Replace by real API call
 */
const sleep = (ms: number = 3000) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const loadMinistries = (): ThunkActionType => async dispatch => {
  dispatch({ type: ACTION_TYPES.MINISTRY_LIST_LOAD_START });
  await sleep(3000);
  dispatch({
    payload: MOCK_IDP_FROM_BACKEND,
    type: ACTION_TYPES.MINISTRY_LIST_LOAD_COMPLETED,
  });
};

export default loadMinistries;
