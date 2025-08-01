import $ from 'jquery';
import "bootstrap/dist/js/bootstrap";

export function handleEmail() {
  let i = 0;
  $('#addEmail').click((ev) => {
    $('.email-list').append(`
      <li id="email${i}">
        <div class="col-xs-9 col-sm-12 col-md-4">
          <label class="sr-only" for="email">Emails</label>
          <div class="input-group mb-2">
                <div class="input-group-prepend">
                  <div class="delete-email input-group-text">
                    <a data-reference="email${i}" id="deleteEmail" class="delete-btn" href="#">x</a>
                  </div>
          </div>
          <input type="email" 
            class="form-control" 
            id="inlineFormInputGroup" 
            placeholder="email" 
            name="email"
            pattern='^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$' 
            required>
        </div>
      </li>
    `);
    i++;
  });
}

$(document).on('click', '#deleteEmail', function (e) {
  const child = e.target.dataset.reference;
  document.getElementById("email-list").removeChild(document.getElementById(child));
});
