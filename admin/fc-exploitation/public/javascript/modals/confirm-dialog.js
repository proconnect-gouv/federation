import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap';

export function confirmDialog(message, handler) {
  $(`<div class="modal fade confirm-modal" tabindex="-1" role="dialog"> 
    <div class="modal-dialog modal-dialog-centered" role="document"> 
      <!-- Modal content--> 
      <div class="modal-content"> 
        <div class="modal-body">
          <div class="container-fluid">
            <div class="row">
              <div class="col-12 text-center">${message}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer d-flex justify-content-center" style=""> 
          <button class="btn btn-danger btn-no">Annuler</button>
          <button class="btn btn-success btn-yes">Confirmer</button>
        </div>
      </div> 
    </div> 
  </div>`).appendTo('body');

  //Trigger the modal
  $('.confirm-modal').modal({
    backdrop: 'static',
    keyboard: false,
  });

  //Pass true to a callback function
  $('.btn-yes').click(function() {
    handler(true);
    $('.confirm-modal').modal('hide');
  });

  //Pass false to a callback function
  $('.btn-no').click(function() {
    handler(false);
    $('.confirm-modal').modal('hide');
  });

  //Remove the modal once it is closed.
  $('.confirm-modal').on('hidden.bs.modal', function() {
    $('.confirm-modal').remove();
  });
}

export function confirmDialogWithTotp(message, handler) {
  $(`<div class="modal fade confirm-modal-totp" tabindex="-1" role="dialog"> 
    <div class="modal-dialog modal-dialog-centered" role="document"> 
      <!-- Modal content--> 
      <div class="modal-content"> 
        <div class="modal-body">
          <div class="container-fluid">
            <div class="row">
              <div class="col-12 text-center">${message}</div>
            </div>
            <div class="row mt-4 d-flex align-items-center" style="font-size: 1rem">
              <label class="col-2 col-form-label" for="totpModal">TOTP</label>
              <div class="col-10 d-flex flex-column">
                <input id="totpModal" class="form-control form-control-sm" type="text" name="_totp" autofocus="" autocomplete="off" required>
                <div class="invalid-feedback">
                  Le TOTP n'a pas été saisi
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer d-flex justify-content-center" style=""> 
          <button class="btn btn-danger btn-no">Annuler</button>
          <button class="btn btn-success btn-yes">Confirmer</button>
        </div>
      </div> 
    </div> 
  </div>`).appendTo('body');

  //Trigger the modal
  $('.confirm-modal-totp').modal({
    backdrop: 'static',
    keyboard: false,
  });

  //Pass true to a callback function
  $('.btn-yes').click(function() {
    const totp = document.getElementById('totpModal');
    if (totp.value !== '') {
      totp.classList.remove('is-invalid');
      handler(true, totp.value);
      $('.confirm-modal-totp').modal('hide');
    } else {
      totp.classList.add('is-invalid');
    }
  });

  //Pass false to callback function
  $('.btn-no').click(function() {
    handler(false, '');
    $('.confirm-modal-totp').modal('hide');
  });

  // Every time a modal is shown, if it has an autofocus element, focus on it.
  $('.modal').on('shown.bs.modal', function() {
    $(this)
      .find('[autofocus]')
      .focus();
  });

  //Remove the modal once it is closed.
  $('.confirm-modal-totp').on('hidden.bs.modal', function() {
    $('.confirm-modal-totp').remove();
  });
}
