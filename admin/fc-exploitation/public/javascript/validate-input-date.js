import moment from 'moment';

let dateDebutEl;
let dateFinEl;
let submitButton;

export function validateInputDate(element) {
  dateDebutEl = document.getElementById('dateDebut');
  dateFinEl = document.getElementById('dateFin');
  submitButton = document.getElementById('submit-button');

  element.addEventListener('input', function(){
    if (moment(dateDebutEl.value).isAfter(dateFinEl.value)) {
      dateDebutEl.classList.add('is-invalid');
      dateFinEl.classList.add('is-invalid');
      submitButton.setAttribute('disabled', '');
    } else {
      dateDebutEl.classList.remove('is-invalid');
      dateDebutEl.classList.add('is-valid');
      dateFinEl.classList.remove('is-invalid');
      dateFinEl.classList.add('is-valid');
      submitButton.removeAttribute('disabled');
    }
  });
}
