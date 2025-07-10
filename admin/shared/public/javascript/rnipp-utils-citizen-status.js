import $ from 'jquery';
import moment from 'moment';
import { lazyInit } from './lazy-init';
import { confirmDialogWithTotp } from './modals/confirm-dialog';
import { getCSRFToken, updateUIError } from './rnipp-utils';

export const CITIZEN_STATUS_TARGET = '#citizen-status';

export const API = {
  checkUser: `${window.APP_ROOT || ''}/citizen`,
};

function reloadSearch(element) {
  $(element).on('click', () => $('#rnipp-form').submit());
}

function toggleCitizenActive(element) {
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

export function updateUISuccessPost(index, data) {
  createCitizenStatusUi(index, data);
}

export function updateUISuccess(index, data) {
  createCitizenStatusUi(index, data);
}

function createCitizenStatusUi(index, data) {
  const lastConnection = data.lastConnection
    ? `le ${moment(data.lastConnection).format('DD/MM/YYYY à HH:mm:ss')}`
    : 'Jamais';

  let accountIdHTML = '';
  if (data.accountId) {
    accountIdHTML = `<li><b>AccountId : </b><span data-testid="citizen-account-id">${data.accountId}</span></li>`;
  }

  $(`${CITIZEN_STATUS_TARGET}-${index}`).html(`
    <ul>
      <li><b>Actif :</b> ${
        data.active
          ? '<span class="badge badge-success" data-testid="citizen-account-status">Oui</span>'
          : '<span class="badge badge-danger" data-testid="citizen-account-status">Non</span>'
      }</li>
      <li><b>Dernière connexion : </b><span data-testid="citizen-account-last-connection">${lastConnection}</span></li>
      ${accountIdHTML}
    </ul>
  `);
}

export function initUIActiveButton(rectifiedIdentity, index, data) {
  // Errors handling
  if (data.status && data.status !== 404) {
    $(`${CITIZEN_STATUS_TARGET}-${index}`).html(`
      Une erreur est survenue : ${data.responseText}.
      <br />
      <button class="btn btn-primary" data-init="reloadSearch">Relancer la recherche</button>
    `);

    return lazyInit({ reloadSearch }, `${CITIZEN_STATUS_TARGET}-${index}`);
  }

  const action = data.active === false ? 'Activer' : 'Désactiver';

  const {
    preferredUsername,
    familyName,
    givenName,
    birthdate,
    birthPlace,
    birthCountry,
    gender,
  } = rectifiedIdentity;

  const html = `
  <form name="deleteForm" method="POST" id="delete-activationToogle"
    action="${API.checkUser}?_method=PATCH"
    class="d-flex align-items-center"
    data-init="toggleCitizenActive"
    data-element-index="${index}"
    data-element-type="l'accès à FranceConnect pour cet usager"
    data-element-title="${givenName} ${familyName}" data-element-id="delete-activationToogle"
    data-element-action="Voulez vous ${action.toLowerCase()} ${givenName} ${familyName} ?"
    novalidate
  >
    <input type="hidden" name="preferredUsername" value="${preferredUsername ||
      ''}" />
    <input type="hidden" name="familyName" value="${familyName}" />
    <input type="hidden" name="givenName" value="${givenName}" />
    <input type="hidden" name="birthdate" value="${birthdate}" />
    <input type="hidden" name="isFrench" value="${birthCountry === '99100'}" />
    <input type="hidden" name="birthLocation" value="${birthPlace ||
      birthCountry}" />
    <input type="hidden" name="gender" value="${gender}" />
    <input type="hidden" name="supportId" value="${__SUPPORT_ID__}" />
    <input type="hidden" name="active" value="${
      data.active ? 'false' : 'true'
    }" />
    <input type="hidden" name="_csrf" value="${getCSRFToken()}">
    <input type="hidden" name="_totp">


    <div class="form-group" id="citizen-management">
    <button type="submit" class="btn btn-warning" data-testid="citizen-disable-account-button" ${action ===
      'Activer' && 'disabled'}>
      Désactiver
    </button>
    &nbsp;
    <button type="submit" class="btn btn-warning" data-testid="citizen-enable-account-button" ${action ===
      'Désactiver' && 'disabled'}>
      Activer
    </button>
    </div>
  </form>
  `;

  $(`${CITIZEN_STATUS_TARGET}-${index}`).append(html);

  lazyInit({ toggleCitizenActive }, `${CITIZEN_STATUS_TARGET}-${index}`);
}

function setLoadingUI(selector) {
  $(selector).html('<div class="spinner"><i></i></div> Chargement...');
}

function postAjaxForm(form, index) {
  setLoadingUI(`${CITIZEN_STATUS_TARGET}-${index}`);

  const { rectifiedIdentity } = __RNIPP_DATA_RESULTS__[index].person;

  $.ajax({
    method: 'POST',
    url: form.attr('action'),
    data: form.serialize(),
  })
    .done((...args) => updateUISuccessPost(index, ...args))
    .fail(updateUIError.bind(null, `${CITIZEN_STATUS_TARGET}-${index}`))
    .always((...args) => initUIActiveButton(rectifiedIdentity, index, ...args));
}
