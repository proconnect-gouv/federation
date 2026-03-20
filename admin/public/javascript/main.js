import "babel-polyfill";
import $ from "./jquery_wrapper";
// NOTE: must be imported after jquery_wrapper
import "bootstrap/dist/js/bootstrap.bundle";

import { changeDiscovery, changeSignature, initForm } from "./change-discovery";
import { copyText } from "./clipboard";
import { comparePassword } from "./compare-password";
import { customFileInput } from "./custom-file-input";
import {
  displayRemoveButtonEvent,
  submitDeletion,
} from "./delete-service-provider";
import { handleEmail } from "./handle-email";
import { itemPerPage } from "./item-par-page";
import { lazyInit } from "./lazy-init";
import { removeItem, updateItem } from "./modals/confirm-form";
import { generateNewSecret } from "./modals/generate-client-secret.modal";
import { validateNotificationCreation } from "./modals/validate-notification-creation";
import { searchReset } from "./search-reset";
import { selectScopesGroup } from "./select-scopes-group";
import { toggleByRadio } from "./toggle-by-radio";
import { validateEnrollment } from "./validate-enrollment";
import { validateForm } from "./validate-form";
import { validateInputDate } from "./validate-input-date";
import { validateInputHour } from "./validate-input-hour";
import { validateAccountCreate } from "./validateAccountCreate";
import { validateAccountUpdate } from "./validateAccountUpdate";

import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.css";
import "../style/main.less";

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
  validateNotificationCreation,
  selectScopesGroup,
};

$(document).ready(function () {
  $(".nav-link[data-prefix]").each(function (index, link) {
    const prefix = $(link).attr("data-prefix");
    if (window.location.pathname.startsWith(prefix)) {
      $(link).addClass("active");
    }
  });

  lazyInit(initMap, "body");
});
