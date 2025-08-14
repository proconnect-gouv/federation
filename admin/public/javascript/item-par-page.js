import $ from './jquery_wrapper';

export function itemPerPage(element) {
  const form = $('#itemPerPage');

  element.addEventListener('change', function (ev) {
    $('#itemNumberList').removeClass('selected');
    form.submit();
  });
}
