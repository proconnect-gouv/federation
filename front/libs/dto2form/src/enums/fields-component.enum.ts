import { ChoicesField, FieldTypes, InputField, SelectField } from '@fc/forms';

export const FieldsCommponentMap = {
  [FieldTypes.CHECKBOX]: ChoicesField,
  [FieldTypes.DATE]: InputField,
  [FieldTypes.EMAIL]: InputField,
  [FieldTypes.HIDDEN]: InputField,
  [FieldTypes.NUMBER]: InputField,
  [FieldTypes.RADIO]: ChoicesField,
  [FieldTypes.SELECT]: SelectField,
  [FieldTypes.TEXT]: InputField,
  [FieldTypes.TEXTAREA]: InputField,
};
