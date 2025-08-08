import $ from 'jquery';

export function customFileInput(element) {
  // Display the name of the selected file
  $(element).on('change', function () {
    var fileName = $(this).val().split('\\').pop();
    $(this).siblings('.custom-file-label').addClass('selected').html(fileName);
  });
}
