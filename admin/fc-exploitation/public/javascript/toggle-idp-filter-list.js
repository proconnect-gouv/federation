export function toggleIdpFilterList(elt) {
  elt.addEventListener('change', function () {

    const optionSelected = elt.options[elt.selectedIndex].text;
    const hasNoRestriction = optionSelected === 'Aucune restriction';

      document
        .querySelectorAll('#idpFilterList input[type="checkbox"]')
        .forEach(child => {
          child.disabled = hasNoRestriction;

          if(hasNoRestriction) {
            // We uncheck the checkbox and remove class so that the user visually understands
            child.checked = false;
            child.classList.remove('is-valid');
          }
      });

    },
  );
}