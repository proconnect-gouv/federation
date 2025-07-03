import $ from 'jquery';
export function validateForm(element) {
  const inputs = element.getElementsByTagName('input');
  const txtAreas = element.getElementsByTagName('textarea');
  const selects = element.querySelectorAll('select');

  // check select
  if (!!selects.length) {
    selects.forEach(select => {
      select.addEventListener('change', function() {
        if (select.required && select.value === '') {
          select.classList.remove('is-valid');
          select.classList.add('is-invalid');
        } else {
          select.classList.add('is-valid');
          select.classList.remove('is-invalid');
        }
      });

      element.addEventListener('submit', function(event) {
        if (select.required && select.value === '') {
          select.classList.remove('is-valid');
          select.classList.add('is-invalid');
          event.preventDefault();
          event.stopPropagation();
        } else {
          select.classList.add('is-valid');
          select.classList.remove('is-invalid');
        }
      });
    });
  }

  // check input
  if (!!inputs.length) {
    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        inputs[key].addEventListener(
          'input',
          function() {
            // check if inputs which change are valid
            if (inputs[key].checked) {
              const inputRadioName = inputs[key].getAttribute('name');
              const inputsRadio = document.querySelectorAll(
                `input[name="${inputRadioName}"]`,
              );
              inputsRadio.forEach(inputRadio => {
                inputRadio.classList.add('is-valid');
              });
            }
            // check input pattern
            if (inputs[key].checkValidity() === false) {
              inputs[key].classList.remove('is-valid');
              inputs[key].classList.add('is-invalid');
            } else {
              inputs[key].classList.remove('is-invalid');
              inputs[key].classList.add('is-valid');
            }
          },
          false,
        );
        // check on submit if form is valid
        element.addEventListener(
          'submit',
          function(event) {
            if (inputs[key].checkValidity() === false) {
              inputs[key].classList.remove('is-valid');
              inputs[key].classList.add('is-invalid');
              event.preventDefault();
              event.stopPropagation();
            } else {
              inputs[key].classList.remove('is-invalid');
              inputs[key].classList.add('is-valid');
            }
            if (inputs[key].disabled) {
              inputs[key].value = null;
            }
          },
          false,
        );
      }
    }
  }

  // Textarea
  if (!!txtAreas.length) {
    for (const key in txtAreas) {
      if (txtAreas.hasOwnProperty(key)) {
        txtAreas[key].addEventListener('input', function() {
          validateTextarea(txtAreas[key]);
        });
        element.addEventListener(
          'submit',
          function(event) {
            if (!validateTextarea(txtAreas[key])) {
              txtAreas[key].classList.remove('is-valid');
              txtAreas[key].classList.add('is-invalid');
              event.preventDefault();
              event.stopPropagation();
            }
          },
          false,
        );
      }
    }
  }

  // force consent to "not required" if service provider type is "public"
  $('.is-consent-required').on('change', e => {
    const isPublicProvider = e.target.value === 'public';
    $('.consent')
      .eq(0)
      .attr('disabled', isPublicProvider);

    if (isPublicProvider) {
      $('.consent[value="false"]').prop('checked', true);
    }
  });
}

function validateTextarea(textarea) {
  const textAreaValue = $(textarea).val();
  const isTextAreaRequired = $(textarea).attr('required');
  if (!isTextAreaRequired && textAreaValue === '') {
    $(textarea).toggleClass('is-invalid', false);
    $(textarea).toggleClass('is-valid', true);
    return true;
  }
  const pattern = new RegExp('^' + $(textarea).attr('pattern') + '$');
  let isValid = false;
  // check each line of text
  $.each(textAreaValue.split('\n'), function() {
    // check if the line matches the pattern
    isValid = pattern.test(this);
    // Not supported by the browser, fallback to manual error display...
    $(textarea).toggleClass('is-invalid', !isValid);
    $(textarea).toggleClass('is-valid', isValid);
    return isValid;
  });
  return isValid;
}
