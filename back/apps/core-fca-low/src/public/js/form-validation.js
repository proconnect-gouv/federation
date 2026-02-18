document.addEventListener('DOMContentLoaded', function () {
  var forms = document.querySelectorAll('form');

  function updateAllForms() {
    forms.forEach(function (form) {
      var submitButton = form.querySelector('button.fr-btn');
      if (!submitButton) return;

      submitButton.disabled = !form.checkValidity();
    });
  }

  forms.forEach(function (form) {
    var submitButton = form.querySelector('button.fr-btn');
    if (!submitButton) return;

    form.addEventListener('input', updateAllForms);
    form.addEventListener('change', updateAllForms);
  });

  updateAllForms();

  window.addEventListener('pageshow', updateAllForms);
});
