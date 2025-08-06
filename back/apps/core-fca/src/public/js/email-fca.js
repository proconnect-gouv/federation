const LOCAL_STORAGE_MAIL = 'proConnectEmail';

function init() {
  const localStorageEmail = localStorage.getItem('proConnectEmail');
  const checkbox = document.getElementById('remember-me');
  if (localStorageEmail) {
    checkbox.checked = true;
  } else {
    checkbox.checked = false;
  }
  let isRememberMe = checkbox.checked;
  checkbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
      isRememberMe = true;
    } else {
      isRememberMe = false;
    }
  });

  const input = document.querySelector('#email-input');
  const button = document.querySelector('#email-submit-button');

  let loginHint;

  const container = document.querySelector('#email-container');
  if (container && container.dataset.loginHint) {
    loginHint = container.dataset.loginHint;
  }

  if (loginHint) {
    localStorage.setItem(LOCAL_STORAGE_MAIL, loginHint);
    input.value = loginHint;
  } else {
    const proConnectEmail = localStorage.getItem(LOCAL_STORAGE_MAIL);
    if (proConnectEmail) {
      input.value = proConnectEmail;
    }
  }

  button.addEventListener('click', () => {
    if (isRememberMe) {
      localStorage.setItem(LOCAL_STORAGE_MAIL, input.value);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_MAIL);
    }
  });
}

init();
