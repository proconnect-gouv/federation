const LOCAL_STORAGE_MAIL = 'agentConnectEmail';

function init() {
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
    const agentConnectEmail = localStorage.getItem(LOCAL_STORAGE_MAIL);
    if (agentConnectEmail) {
      input.value = agentConnectEmail;
    }
  }

  button.addEventListener('click', () => {
    localStorage.setItem(LOCAL_STORAGE_MAIL, input.value);
  });
}

init();
