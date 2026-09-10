import { AlgoValue } from "../../src/enum";

export function changeDiscovery() {
  document
    .querySelector("#no-discovery")
    .addEventListener("change", function () {
      _handleState("discovery-url-row", true);
      _handleState("userinfo-url-row", false);
      _handleState("authorization-url-row", false);
      _handleState("token-url-row", false);
      displayJwksUrlField();
    });

  document.querySelector("#discovery").addEventListener("change", function () {
    _handleState("discovery-url-row", false);
    _handleState("userinfo-url-row", true);
    _handleState("authorization-url-row", true);
    _handleState("token-url-row", true);
    displayJwksUrlField();
  });
}

export function changeSignature() {
  const fiForm = document.getElementById("fi-form");
  const idTokenSignedResponseAlg =
    fiForm.elements["id_token_signed_response_alg"];
  const userInfoSignedResponseAlg =
    fiForm.elements["userinfo_signed_response_alg"];

  idTokenSignedResponseAlg.addEventListener("change", function () {
    displayJwksUrlField();
  });
  userInfoSignedResponseAlg.addEventListener("change", function () {
    displayJwksUrlField();
  });
}

export function initForm() {
  displayJwksUrlField();
}

export function displayJwksUrlField() {
  const fiForm = document.getElementById("fi-form");
  const idTokenSignedResponseAlg =
    fiForm.elements["id_token_signed_response_alg"];
  const userInfoSignedResponseAlg =
    fiForm.elements["userinfo_signed_response_alg"];

  const idTokenSignedResponseAlgValue = idTokenSignedResponseAlg.value;
  const userInfoSignedResponseAlgValue = userInfoSignedResponseAlg.value;

  const discovery = fiForm.elements["discovery"].value === "true";

  const asymmetricSignature = [AlgoValue.ES256, AlgoValue.RS256];
  const useAsymmetricSignature =
    asymmetricSignature.includes(idTokenSignedResponseAlgValue) ||
    asymmetricSignature.includes(userInfoSignedResponseAlgValue);

  const isJwksUrlOptional = discovery || !useAsymmetricSignature;
  _handleState("jwks-url-row", isJwksUrlOptional);
}

// Handle changes for input state & label wording
const _handleState = (rowName, isDisabled) => {
  const row = document.getElementById(rowName);
  const requiredLabel = document.querySelector(`#${rowName} label span`);
  const input = document.querySelector(`#${rowName} input`);
  input.disabled = isDisabled;
  input.required = !isDisabled;
  if (isDisabled) {
    row.classList.add("d-none");
    requiredLabel.classList.add("d-none");
    if (input.classList.contains("is-invalid")) {
      input.classList.add("is-invalid-disabled");
      input.classList.remove("is-invalid");
    }
  } else {
    row.classList.remove("d-none");
    requiredLabel.classList.remove("d-none");
    if (input.classList.contains("is-invalid-disabled")) {
      input.classList.add("is-invalid");
    }
  }
};
