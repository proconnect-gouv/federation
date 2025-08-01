import $ from 'jquery';
import { lazyInit } from './lazy-init';
import { confirmDialogWithTotp } from './modals/confirm-dialog';
import { getCSRFToken, updateUIError } from './rnipp-utils';

const CITIZEN_IDP_PREFERENCE_TARGET = '#citizen-idp-preferences';

const API = {
  setPreferences: `${window.APP_ROOT || ''}/preferences/idpPreferences`,
  setFuturIdp: `${window.APP_ROOOT || ''}/preferences/futureIdp`,
};

function toggleIdpPreferences(element) {
  const elmId = element.getAttribute('data-element-id');
  const elmAction = element.getAttribute('data-element-action');
  const elmIndex = element.getAttribute('data-element-index');

  element.addEventListener(
    'submit',
    function(event) {
      event.preventDefault();
      event.stopPropagation();

      confirmDialogWithTotp(`${elmAction}`, (confirm, totp) => {
        if (confirm) {
          $(`#${elmId} input[name="_totp"]`).val(totp);
          postAjaxForm($(`#${elmId}`), elmIndex);
        }
      });
    },
    false,
  );
}

function createUserIdpList(rectifiedIdentity, index, list) {
  let li = '';
  let myList;

  if (!Array.isArray(list)) {
    myList = list.userIdpSettings.idpList;
  } else {
    myList = list;
  }

  myList.forEach(idp => {
    const idpBadge = idp.isChecked
      ? 'label-idp-preferences-success'
      : 'label-idp-preferences-danger';
    const idpLabel = idp.isChecked ? 'Autorisé' : 'Bloqué';
    const btnColor = idp.isChecked ? 'danger' : 'success';
    const btnLabel = idp.isChecked ? 'Bloquer' : 'Autoriser';

    const {
      preferredUsername,
      familyName,
      givenName,
      birthdate,
      birthPlace,
      birthCountry,
      gender,
    } = rectifiedIdentity;

    const action = idp.isChecked === false ? 'Autoriser' : 'Bloquer';

    li += `
      <li class="pad-15 marg-15" data-testid="${idp.name}">
          <form name="idpPreferencesForm${idp.uid}"
          method="POST" id="idpPreferencesToogle-${idp.uid}"
            class="d-flex align-items-center"
            action="${API.setPreferences}?_method=PATCH"
            data-init="toggleIdpPreferences"
            data-element-type="l'accès à FranceConnect pour cet usager"
            data-element-index="${index}"
            data-element-title="${givenName} ${familyName}" data-element-id="idpPreferencesToogle-${
      idp.uid
    }"
            data-element-action="Voulez vous ${action.toLowerCase()} ${
      idp.title
    } ?"
            novalidate>
            <strong data-testid="idp-title-label">${
              idp.title
            } est <span data-testid="idp-status-label" class="${idpBadge}">${idpLabel}</span></strong>
            <input type="hidden" name="preferredUsername" value="${preferredUsername ||
              ''}" />
            <input type="hidden" name="familyName" value="${familyName}" />
            <input type="hidden" name="givenName" value="${givenName}" />
            <input type="hidden" name="birthdate" value="${birthdate}" />
            <input type="hidden" name="isFrench" value="${birthCountry ===
              '99100'}" />
            <input type="hidden" name="birthLocation" value="${birthPlace ||
              birthCountry}" />
            <input type="hidden" name="gender" value="${gender}" />
            <input type="hidden" name="supportId" value="${__SUPPORT_ID__}" />
            <input type="hidden" name="_csrf" value="${getCSRFToken()}">
            <input type="hidden" name="_totp">
            <input type="hidden" name="uid" value="${idp.uid}" />
            <input type="hidden" name="isChecked" value="${idp.isChecked}" />
            ${
              __APP_NAME__ === 'FC_EXPLOITATION'
                ? `<button type="submit" data-testid="idp-action-button" class="btn-idp-preferences right btn-${btnColor}">${btnLabel}</button>`
                : ''
            }
          </form>
      </li>
    `;
  });
  return li;
}

function createFuturesIdpPreferences(rectifiedIdentity, index, allowFutureIdp) {
  const futurIdpBadge = allowFutureIdp
    ? 'label-idp-preferences-success'
    : 'label-idp-preferences-danger';
  const futurIdpLabel = allowFutureIdp ? 'Autorisés' : 'Bloqués';
  const futurIdpBtn = allowFutureIdp ? 'danger' : 'success';
  const futurIdpBtnLabel = allowFutureIdp ? 'Bloquer' : 'Autoriser';

  const action = allowFutureIdp ? 'Bloquer' : 'Autoriser';

  const {
    preferredUsername,
    familyName,
    givenName,
    birthdate,
    birthPlace,
    birthCountry,
    gender,
  } = rectifiedIdentity;

  return `
    <form name="allowFutureIdpToogleForm" method="POST" id="allowFutureIdpToogle"
      class="d-flex align-items-center"
      action="${API.setFuturIdp}?_method=PATCH"
      data-init="toggleIdpPreferences"
      data-element-type="l'accès à FranceConnect pour cet usager"
      data-element-title="${givenName} ${familyName}" data-element-id="allowFutureIdpToogle"
      data-element-action="Voulez vous ${action.toLowerCase()} les Futurs fournisseurs d'identités ?"
      data-element-index="${index}"
      novalidate>
      <b>Les futurs fournisseurs d'identité sont : </b><span data-testid="future-idp-status-label" class="${futurIdpBadge}">${futurIdpLabel}</span>
      <input type="hidden" name="preferredUsername" value="${preferredUsername ||
        ''}" />
      <input type="hidden" name="familyName" value="${familyName}" />
      <input type="hidden" name="givenName" value="${givenName}" />
      <input type="hidden" name="birthdate" value="${birthdate}" />
      <input type="hidden" name="isFrench" value="${birthCountry ===
        '99100'}" />
      <input type="hidden" name="birthLocation" value="${birthPlace ||
        birthCountry}" />
      <input type="hidden" name="gender" value="${gender}" />
      <input type="hidden" name="supportId" value="${__SUPPORT_ID__}" />
      <input type="hidden" name="_csrf" value="${getCSRFToken()}">
      <input type="hidden" name="_totp">
      <input type="hidden" name="allowFutureIdp" value="${allowFutureIdp}" />
      ${
        __APP_NAME__ === 'FC_EXPLOITATION'
          ? `<button type="submit" data-testid="future-idp-action-button" class="btn-idp-preferences right btn-${futurIdpBtn}">${futurIdpBtnLabel}</button>`
          : ''
      }
    </form>
  `;
}

function updateUIPreferencesPost(rectifiedIdentity, index, data) {
  updateUIPreferences(rectifiedIdentity, index, data);
}

export function updateUIPreferencesInit(rectifiedIdentity, index, data) {
  updateUIPreferences(rectifiedIdentity, index, data);
}

function updateUIPreferences(rectifiedIdentity, index, data) {
  let userIdpList;
  let futuresIdpPreferences;
  if (data.havePreferencesSettings && data.userIdpSettings) {
    if (data.userIdpSettings.idpList) {
      userIdpList = createUserIdpList(
        rectifiedIdentity,
        index,
        data.userIdpSettings.idpList,
      );
      futuresIdpPreferences = createFuturesIdpPreferences(
        rectifiedIdentity,
        index,
        data.userIdpSettings.allowFutureIdp,
      );
    }

    $(`${CITIZEN_IDP_PREFERENCE_TARGET}-${index}`).html(`

      ${
        userIdpList
          ? `<p>${futuresIdpPreferences}</p> <ul>${userIdpList}</ul>`
          : ''
      }
    `);
  }

  lazyInit(
    { toggleIdpPreferences },
    `${CITIZEN_IDP_PREFERENCE_TARGET}-${index}`,
  );
}

function setLoadingUI(selector) {
  $(selector).html('<div class="spinner"><i></i></div> Chargement...');
}

function postAjaxForm(form, index) {
  setLoadingUI(`${CITIZEN_IDP_PREFERENCE_TARGET}-${index}`);

  const { rectifiedIdentity } = __RNIPP_DATA_RESULTS__[index].person;

  $.ajax({
    method: 'POST',
    url: form.attr('action'),
    data: form.serialize(),
  })
    .done((...args) =>
      updateUIPreferencesPost(rectifiedIdentity, index, ...args),
    )
    .fail(updateUIError.bind(null, `${CITIZEN_IDP_PREFERENCE_TARGET}-${index}`))
    .always((...args) => {
      createUserIdpList(rectifiedIdentity, index, ...args);
      createFuturesIdpPreferences(rectifiedIdentity, index, ...args);
    });
}
