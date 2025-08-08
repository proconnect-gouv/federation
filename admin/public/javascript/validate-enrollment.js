export function validateEnrollment(element) {

  const inputs = element.getElementsByTagName('input');
  for (let i = 0; i < inputs.length; ++i) {
    inputs[i].addEventListener('input', function () {
      // check input pattern
      if (inputs[i].checkValidity() === false) {
        inputs[i].classList.remove('is-valid');
        inputs[i].classList.add('is-invalid');
      } else {
        inputs[i].classList.remove('is-invalid');
        inputs[i].classList.add('is-valid');
      }

    }, false);

    // check on submit if form is valid
    element.addEventListener('submit', function (event) {
      if (inputs[i].checkValidity() === false) {
        inputs[i].classList.remove('is-valid');
        inputs[i].classList.add('is-invalid');
        event.preventDefault();
        event.stopPropagation();

      } else {
        inputs[i].classList.remove('is-invalid');
        inputs[i].classList.add('is-valid');
      }

    }, false);
  }
}
