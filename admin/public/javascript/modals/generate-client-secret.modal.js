import { confirmDialog } from "./confirm-dialog";

export function generateNewSecret(element) {
  const elmTitle = element.getAttribute("data-element-title");
  element.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();
      event.stopPropagation();

      confirmDialog(
        {
          before: "La génération d'un nouveau secret pour ",
          highlight: elmTitle,
          after:
            " va écraser immédiatement la valeur actuelle. Etes-vous sûr de vouloir changer le secret maintenant ?",
        },
        (confirm) => {
          if (confirm) {
            document.getElementById(`generate-client-secret`).submit();
          }
        },
      );
    },
    false,
  );
}
