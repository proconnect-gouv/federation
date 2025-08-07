import moment from 'moment';

export function validateInputHour(element) {
  const heureDebutEl = document.getElementById('heureDebut');
  const heureFinEl = document.getElementById('heureFin');
  const submitButton = document.getElementById('submit-button');

  element.addEventListener('input', function(){
    const heureDebutVal = `${document.getElementById('dateDebut').value}T${document.getElementById('heureDebut').value}`;
    const heureFinVal = `${document.getElementById('dateFin').value }T${document.getElementById('heureFin').value}`;
    
    if (moment(new Date(heureDebutVal)).isAfter(new Date(heureFinVal))) {
      heureDebutEl.classList.add('is-invalid');
      heureFinEl.classList.add('is-invalid');

      submitButton.setAttribute('disabled', '');
    } else {
      heureDebutEl.classList.remove('is-invalid');
      heureDebutEl.classList.add('is-valid');

      heureFinEl.classList.remove('is-invalid');
      heureFinEl.classList.add('is-valid');

      submitButton.removeAttribute('disabled');
    }
  });
}
