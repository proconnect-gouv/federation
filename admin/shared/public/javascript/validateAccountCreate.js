import { inputValid, inputInvalid } from './addValidClass';

export function validateAccountCreate(element) {
  const inputs = element.getElementsByTagName('input');
  const inputCheckboxRoles = Object.values(
    document.querySelectorAll('input[name="roles"]'),
  );

  for (let i = 0; i < inputs.length; ++i) {
    // check if inputs which change are valid
    inputs[i].addEventListener(
      'input',
      function(event) {
        // check input pattern
        if (inputs[i].checkValidity() === false) {
          inputInvalid(inputs[i]);
        } else {
          inputValid(inputs[i]);
        }

        // check if inputs checkbox which change are valid
        if (inputs[i].checked) {
          inputCheckboxRoles.forEach(chkboxRole => {
            inputValid(chkboxRole);
            document.querySelector('.roles-error').innerText = '';
          });
        } else {
          const countCheckedRole = inputCheckboxRoles.filter(
            ({ checked }) => checked === true,
          ).length;
          if (countCheckedRole === 0) {
            inputCheckboxRoles.forEach(chkboxRole => {
              inputInvalid(chkboxRole);
            });
            document.querySelector('.roles-error').innerText =
              'Veuillez renseigner au moins un rôle';
          }
        }
      },
      false,
    );

    // check on submit if form is valid
    element.addEventListener(
      'submit',
      function(event) {
        const countCheckedRole = inputCheckboxRoles.filter(
          ({ checked }) => checked === true,
        ).length;

        if (inputs[i].checkValidity() === false) {
          inputInvalid(inputs[i]);
          event.preventDefault();
          event.stopPropagation();
        } else {
          inputValid(inputs[i]);
        }

        if (countCheckedRole === 0) {
          inputCheckboxRoles.forEach(chkboxRole => {
            inputInvalid(chkboxRole);
          });
          document.querySelector('.roles-error').innerText =
            'Veuillez renseigner au moins un rôle';
          event.preventDefault();
          event.stopPropagation();
        } else {
          document.querySelector('.roles-error').innerText = '';
        }
      },
      false,
    );
  }
}
