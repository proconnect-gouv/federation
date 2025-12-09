document.addEventListener(
  'DOMContentLoaded',
  function () {
    var input = document.getElementById('email-input');
    var element = document.getElementById('email-suggestion-element');
    var link = document.getElementById('email-suggestion-link');

    function fillInputWithSuggestion(e) {
      e.stopPropagation();
      e.preventDefault();
      input.value = link.innerText;
      element.style.display = 'none';
      input.focus();
    }

    link.addEventListener('click', fillInputWithSuggestion);
  },
  false,
);
