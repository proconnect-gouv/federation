import { inputValid, inputInvalid } from './addValidClass';

export function validateAccountUpdate(element) {
  const inputs = element.getElementsByTagName('input');

  for (let i = 0; i < inputs.length; ++i) {
    // check if inputs which change are valid
    inputs[i].addEventListener('input', function(event){
      // check input pattern
      if (inputs[i].checkValidity() === false) {
        inputInvalid(inputs[i]);
      } else {
        inputValid(inputs[i]);
      }
    }, false);

    // check on submit if form is valid
    element.addEventListener('submit', function(event) {
      if (inputs[i].checkValidity() === false) {
        inputInvalid(inputs[i]);
        event.preventDefault();
        event.stopPropagation();
      } else {
        inputValid(inputs[i]);
      }
    }, false);
  }
}
