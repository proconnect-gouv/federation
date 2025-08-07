import $ from 'jquery';

export function getCSRFToken() {
  return $('input[name="_csrf"]').val();
}

export function updateUIError(target, data) {
  let content = 'Une erreur technique est survenue';

  if (data.status === 404) {
    content = 'Inconnu(e) de FranceConnect';
  }

  $(target).html(`<p>${content}</p>`);
}
