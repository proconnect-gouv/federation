export function changeSpPlatform(elt) {
  elt.addEventListener('click', function() {
    const blacklistWhitelistContainer = document.querySelector(
      '#blacklist-whitelist-container',
    );
    const userinfoSignedResponseAlg = document.querySelector(
      'select[name=userinfo_signed_response_alg]',
    );

    if (elt.value === 'CORE_LEGACY') {
      userinfoSignedResponseAlg.required = false;

      if (!blacklistWhitelistContainer.classList.contains('no-display')) {
        blacklistWhitelistContainer.classList.add('no-display');
      }
    }

    if (elt.value === 'CORE_FCP') {
      userinfoSignedResponseAlg.required = true;
      userinfoSignedResponseAlg.value =
        userinfoSignedResponseAlg.value || 'HS256';

      blacklistWhitelistContainer.classList.remove('no-display');
    }
  });
}
