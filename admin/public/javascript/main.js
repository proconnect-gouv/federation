import 'babel-polyfill';
import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap';
import { validateForm } from './validate-form';
import { changeDiscovery, initForm, changeSignature } from './change-discovery';
import { toggleByRadio } from './toggle-by-radio';
import { itemPerPage } from './item-par-page';
import { generateNewSecret } from './modals/generate-client-secret.modal';
import {
  displayRemoveButtonEvent,
  submitDeletion,
} from './delete-service-provider';
import { removeItem, updateItem } from './modals/confirm-form';
import { customFileInput } from './custom-file-input';
import { lazyInit } from './lazy-init';
import { validateEnrollment } from './validate-enrollment';
import { comparePassword } from './compare-password';
import { copyText } from './clipboard';
import { validateInputDate } from './validate-input-date';
import { validateInputHour } from './validate-input-hour';
import { validateAccountUpdate } from './validateAccountUpdate';
import { validateAccountCreate } from './validateAccountCreate';
import { handleEmail } from './handle-email';
import { searchReset } from './search-reset';
import { csvParser } from './csv-parser';
import { selectScopesGroup } from './select-scopes-group';
import { validateNotificationCreation } from './modals/validate-notification-creation';
import { toggleIdpFilterList } from './toggle-idp-filter-list';
import { changeSpPlatform } from './change-sp-plateform';

import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/fonts/fontawesome-webfont.ttf';
import 'font-awesome/css/font-awesome.css';
import '../style/main.less';

const initMap = {
  initForm,
  validForm: validateForm,
  changeDiscovery,
  toggleByRadio,
  changeSignature,
  removeItem,
  displayRemoveButtonEvent,
  submitDeletion,
  updateItem,
  generateNewSecret,
  customFileInput,
  validateEnrollment,
  comparePassword,
  handleEmail,
  copyText,
  itemPerPage,
  validateInputDate,
  validateInputHour,
  validateAccountUpdate,
  validateAccountCreate,
  searchReset,
  csvParser,
  validateNotificationCreation,
  selectScopesGroup,
  toggleIdpFilterList,
  changeSpPlatform,
};

$(document).ready(function () {
  $('.nav-link[data-prefix]').each(function (index, link) {
    const prefix = $(link).attr('data-prefix');
    if (window.location.pathname.startsWith(prefix)) {
      $(link).addClass('active');
    }
  });

  lazyInit(initMap, 'body');
});
