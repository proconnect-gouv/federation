import $ from 'jquery';

export function itemPerPage(element) {
  const form = $('#itemPerPage')

  element.addEventListener('change', function (ev) {
    $('#itemNumberList').removeClass('selected')
    form.submit()
  })
}
