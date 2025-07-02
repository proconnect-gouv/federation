import { AlgoValue } from '../../src/enum';

export function changeDiscovery() {
  document
    .querySelector('#no-discovery')
    .addEventListener('change', function() {
      _handleState('discoveryUrl', true);
      _handleState('userInfoUrl', false);
      _handleState('authorizationUrl', false);
      _handleState('tokenUrl', false);
      displayJwksUrlField();
    });

  document.querySelector('#discovery').addEventListener('change', function() {
    _handleState('discoveryUrl', false);
    _handleState('userInfoUrl', true);
    _handleState('authorizationUrl', true);
    _handleState('tokenUrl', true);
    displayJwksUrlField();
  });
}

export function changeSignature() {
  const fiForm = document.getElementById('fi-form');
  const idTokenSignedResponseAlg =
    fiForm.elements['id_token_signed_response_alg'];
  const userInfoSignedResponseAlg =
    fiForm.elements['userinfo_signed_response_alg'];

  idTokenSignedResponseAlg.addEventListener('change', function() {
    displayJwksUrlField();
  });
  userInfoSignedResponseAlg.addEventListener('change', function() {
    displayJwksUrlField();
  });
}

export function initForm() {
  displayJwksUrlField();
}

export function displayJwksUrlField() {
  const fiForm = document.getElementById('fi-form');
  const idTokenSignedResponseAlg =
    fiForm.elements['id_token_signed_response_alg'];
  const userInfoSignedResponseAlg =
    fiForm.elements['userinfo_signed_response_alg'];

  const idTokenSignedResponseAlgValue = idTokenSignedResponseAlg.value;
  const userInfoSignedResponseAlgValue = userInfoSignedResponseAlg.value;

  const discovery = fiForm.elements['discovery'].value === 'true';

  const asymmetricSignature = [AlgoValue.ES256, AlgoValue.RS256];
  const useAsymmetricSignature =
    asymmetricSignature.includes(idTokenSignedResponseAlgValue) ||
    asymmetricSignature.includes(userInfoSignedResponseAlgValue);

  const isJwksUrlOptional = discovery || !useAsymmetricSignature;
  _handleState('jwksUrl', isJwksUrlOptional);
}

// Handle changes for input state & label wording
const _handleState = (inputName, isDisabled) => {
  const requiredLabel = document.querySelector(`label[for=${inputName}] span`);
  const input = document.querySelector(`input[name=${inputName}]`);
  input.disabled = isDisabled;
  input.required = !isDisabled;
  if (isDisabled) {
    requiredLabel.classList.add('d-none');
    if (input.classList.contains('is-invalid')) {
      input.classList.add('is-invalid-disabled');
      input.classList.remove('is-invalid');
    }
  } else {
    requiredLabel.classList.remove('d-none');
    if (input.classList.contains('is-invalid-disabled')) {
      input.classList.add('is-invalid');
    }
  }
};
