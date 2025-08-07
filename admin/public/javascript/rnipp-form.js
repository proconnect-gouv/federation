import { validateRnippForm } from './validateForm';
import { checkUserStatus } from './rnipp-check-user';

export function rnippForm(element) {
  // Generic RNIPP form managment
  validateRnippForm(element);
  checkUserStatus();
}
