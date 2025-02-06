import hasProperty from 'lodash.has';

import type { JSONFieldType } from '../../types';

export const parseInitialValues = <T = string | string[]>(
  schema: JSONFieldType[],
  values: Record<string, T>,
): Record<string, T> => {
  const initialValues = schema.reduce((acc, schemaField) => {
    const { initialValue, name } = schemaField;
    const value = hasProperty(values, name) ? values[name] : initialValue;
    return { ...acc, [name]: value };
  }, {});

  return initialValues;
};
