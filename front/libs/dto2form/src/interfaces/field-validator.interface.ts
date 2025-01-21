export interface FieldValidatorBaseInterface {
  name: string;

  validationArgs?: unknown[];
}

export interface FieldValidatorInterface extends FieldValidatorBaseInterface {
  errorLabel: string;
}
