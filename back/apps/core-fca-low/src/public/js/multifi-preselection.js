const LOCAL_STORAGE_LAST_FI_SELECTED = "proConnectLastFISelected";

function init() {
  const localStorageLastFISelected = localStorage.getItem(
    LOCAL_STORAGE_LAST_FI_SELECTED,
  );
  if (!!localStorageLastFISelected) {
    const idpRadioButton = document.querySelector(
      `#idp-${localStorageLastFISelected}`,
    );
    if (idpRadioButton) {
      idpRadioButton.checked = true;
    }
  }

  const submitButton = document.querySelector(
    "#select-identity-provider-submit-button",
  );

  submitButton.addEventListener("click", () => {
    const selectedIdpRadioButton = document.querySelector(
      'input[name="identityProviderUid"]:checked',
    );
    if (selectedIdpRadioButton) {
      localStorage.setItem(
        LOCAL_STORAGE_LAST_FI_SELECTED,
        selectedIdpRadioButton.value,
      );
    }
  });
}

init();
