// Popin opening and closing handling
(function () {
  const openNumericIdentity = document.getElementById('tuto-numeric-identity');
  const numericIdentityPopin = document.getElementById('numeric-identity');
  const interactionOverflow = document.querySelector('body');

  openNumericIdentity.addEventListener('click', (e) => {
    e.preventDefault();
    numericIdentityPopin.classList.add('show');
    interactionOverflow.style.overflow = 'hidden';
  }, true);

  numericIdentityPopin.addEventListener('click', (e) => {
    if (e.target.id !== '') {
      numericIdentityPopin.classList.remove('show');
      interactionOverflow.style.overflow = 'auto';
    }
  }, true);  
})();
