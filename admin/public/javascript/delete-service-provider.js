import $ from 'jquery';
import { confirmDialogWithTotp } from './modals/confirm-dialog';

export function displayRemoveButtonEvent(element) {
  // display delete button if at least one checkbox is checked	
  element.addEventListener('change', function () {
    const chboxs = document.getElementsByClassName("delete-items");
    let display = "none";
    for (let i = 0; i < chboxs.length; i++) {
      if (chboxs[i].checked) {
        display = "block";
        break;
      }
    }
    document.getElementById('delete-button').style.display = display;
  }, false);
};

export function submitDeletion(element) {
  if (element !== null) {
    element.addEventListener('click', function () {
      let deleteItems;
      let eltTitle;
      let i = 0;
      // retrieve all checkbox that are checked
      $("input:checkbox[name=deleteItems]:checked").each(function () {
        if (i === 0) {
          deleteItems = $(this).val();
          eltTitle = $(this).data('elementTitle');
          i++;
        } else {
          deleteItems += ';' + $(this).val();
          eltTitle += ', ' + $(this).data('elementTitle');
        }
      });

      confirmDialogWithTotp(`Voulez-vous supprimer les fournisseurs de service <strong>${eltTitle}</strong> ?`, (confirm, totp) => {
        if (confirm) {
          // create a form for submit all items which must deleted
          const form = document.createElement("form");
          const inputForRemove = document.createElement("input");
          const inputForServiceProviderName = document.createElement("input");
          const inputCsrf = document.createElement("input");
          const inputTotp = document.createElement("input");
          const app_root = document.getElementById("app").value;

          form.method = "POST";
          form.action = `${app_root}/service-provider/delete`;

          inputForRemove.value = deleteItems;
          inputForRemove.name = "deleteItems";
          form.appendChild(inputForRemove);

          inputForServiceProviderName.value = eltTitle;
          inputForServiceProviderName.name = "name";
          form.appendChild(inputForServiceProviderName);

          inputTotp.value = totp;
          inputTotp.name = "_totp";
          form.appendChild(inputTotp);

          inputCsrf.value = document.getElementById("csrf").value;
          inputCsrf.name = "_csrf";
          form.appendChild(inputCsrf);

          document.body.appendChild(form);

          form.submit();
        }
      });
    }, false);
  }
}
