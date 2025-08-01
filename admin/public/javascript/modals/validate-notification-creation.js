import { confirmDialog } from '@pc/shared/public/javascript/modals/confirm-dialog';

export function validateNotificationCreation(element) {
  const form = document.querySelector('form[name="notification"]');
  element.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();

    confirmDialog(`La creation de cette notification entre en conflit avec une autre notification ?`, (confirm) => {
      if (confirm) {
        form.submit()
      }
    });

  }, false);
}
