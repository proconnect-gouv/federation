import $ from 'jquery';
import {
  updateUISuccess,
  initUIActiveButton,
  CITIZEN_STATUS_TARGET,
  API,
} from './rnipp-utils-citizen-status';
import { updateUIPreferencesInit } from './rnipp-utils-user-preference';
import { getCSRFToken, updateUIError } from './rnipp-utils';

function checkUser(httpOptions, index, callback = () => {}) {
  const { data: rectifiedIdentity } = httpOptions;
  $.ajax(API.checkUser, httpOptions)
    .done((...args) => {
      updateUISuccess(index, ...args);
      updateUIPreferencesInit(rectifiedIdentity, index, ...args);
      if (__APP_NAME__ === 'FC_EXPLOITATION') {
        initUIActiveButton(rectifiedIdentity, index, ...args);
      }
    })
    .fail(updateUIError.bind(null, `${CITIZEN_STATUS_TARGET}-${index}`))
    .always(callback);
}

export function checkUserStatus(callback) {
  if (typeof __RNIPP_DATA_RESULTS__ === 'undefined') {
    return;
  }

  const csrfToken = getCSRFToken();

  __RNIPP_DATA_RESULTS__.forEach(
    ({ person: { rectifiedIdentity }, rnippResponse: { code } }, index) => {
      const httpOptions = {
        method: 'POST',
        data: rectifiedIdentity,
        headers: { 'CSRF-Token': csrfToken },
      };

      const identityFound = ~~code < __RECTIFY_RESPONSE_CODES__.error;
      if (identityFound) {
        checkUser(httpOptions, index, callback);
      }
    },
  );
}
