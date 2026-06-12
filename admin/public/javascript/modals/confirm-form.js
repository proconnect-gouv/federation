import { confirmDialogWithTotp } from "./confirm-dialog";

const confirmTotp = (element, prefix, action) => {
  const { dataset } = element;

  const elementId = dataset["elementId"];
  const elementTitle = dataset["elementTitle"];
  const elementType = dataset["elementType"];

  element.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      confirmDialogWithTotp(
        `${prefix} ${elementType} <strong>${elementTitle}</strong> ?`,
        (confirm, totp) => {
          if (confirm) {
            const form = document.querySelector(`#${action}-${elementId}`);
            const totpField = form.querySelector('input[name="_totp"]');
            totpField.value = totp;
            form.submit();
          }
        },
      );
    },
    false,
  );
};

export function removeItem(element) {
  confirmTotp(element, "Voulez-vous supprimer", "delete");
}

export function activateItem(element) {
  confirmTotp(element, "Voulez-vous activer", "activate");
}

export function deactivateItem(element) {
  confirmTotp(element, "Voulez-vous désactiver", "deactivate");
}

export function updateItem(element) {
  confirmTotp(element, "Voulez-vous mettre à jour", "update");
}
