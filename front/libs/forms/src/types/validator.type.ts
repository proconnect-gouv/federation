/* istanbul ignore file */

// declarative file
export type ValidatorType<FieldValue = string> = (value: FieldValue) => string | undefined;
