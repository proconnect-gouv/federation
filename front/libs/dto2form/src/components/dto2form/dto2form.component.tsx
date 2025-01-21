import { useMemo } from 'react';

import { sortByKey } from '@fc/common';
import { ConfigService } from '@fc/config';
import type { FormPropsInterface } from '@fc/forms';
import { FormComponent } from '@fc/forms';

import { Options } from '../../enums';
import type { DTO2FormConfig } from '../../interfaces';
import type { JSONFieldType } from '../../types';
import { DTO2FieldComponent } from '../dto2field/dto2field.component';

interface DTO2FormComponentProps<T> extends FormPropsInterface<T> {
  schema: JSONFieldType[];
}

export function DTO2FormComponent<T>({
  config,
  initialValues,
  onSubmit,
  onValidate,
  schema,
}: DTO2FormComponentProps<T>) {
  const { validateOnSubmit } = ConfigService.get<DTO2FormConfig>(Options.CONFIG_NAME);
  const validateFunc = validateOnSubmit ? onValidate : undefined;

  const fields = useMemo(() => {
    const sorter = sortByKey<JSONFieldType>('order');
    return schema.sort(sorter).map((field) => {
      const key = `form::${config.id}::field::${field.type}::${field.name}`;
      return <DTO2FieldComponent key={key} field={field} />;
    });
  }, [schema, config.id]);

  return (
    <FormComponent
      config={config}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onValidate={validateFunc}>
      {fields}
    </FormComponent>
  );
}
