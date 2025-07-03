import { validateRnippForm } from '@fc/shared/public/javascript/validateForm';
import { checkUserStatus } from './rnipp-check-user';

export function rnippForm(element) {
  // Generic RNIPP form managment
  validateRnippForm(element);
  checkUserStatus();
}
