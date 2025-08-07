export function inputValid(element) {
  element.classList.remove('is-invalid');
  element.classList.add('is-valid');
}

export function inputInvalid(element) {
  element.classList.remove('is-valid');
  element.classList.add('is-invalid');
}