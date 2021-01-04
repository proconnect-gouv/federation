(function () {
  const openCloseMenu = document.querySelector('#openCloseMenu');
  const toggleOpenCloseMenu = document.querySelector('#toggleOpenCloseMenu');
  const moreInformations = document.querySelector('.more-informations');
  
  toggleOpenCloseMenu.addEventListener('click', () => {
      openCloseMenu.classList.toggle('open');
    }, true);
  
  toggleOpenCloseMenu.addEventListener('keydown', (evt) => {
    const allowedKeys = [" ", "Enter", "Spacebar"];
    const canToggle = allowedKeys.includes(evt.key);
    if (canToggle) {
      openCloseMenu.classList.toggle('open');
    }
  }, true);

  toggleOpenCloseMenu.addEventListener('focus', () => {
    toggleOpenCloseMenu.classList.add('border-focus');
  }, true);

  toggleOpenCloseMenu.addEventListener('blur', () => {
    toggleOpenCloseMenu.classList.remove('border-focus');
  }, true);

  moreInformations.addEventListener('focus', () => {
    openCloseMenu.classList.add('open');
  }, true);
})();
