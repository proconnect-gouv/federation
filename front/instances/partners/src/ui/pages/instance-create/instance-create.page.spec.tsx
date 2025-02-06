import { render } from '@testing-library/react';

import type { JSONFieldType } from '@fc/dto2form';
import { DTO2FormComponent } from '@fc/dto2form';

import { useInstanceCreate } from '../../../hooks';
import { InstanceCreatePage } from './instance-create.page';

jest.mock('../../../hooks/instance-create/instance-create.hook');

describe('InstanceCreatePage', () => {
  it('should match the snapshot', () => {
    // Given
    const submitHandlerMock = jest.fn();
    const schemaMock = Symbol('any-schema-mock') as unknown as JSONFieldType[];
    const initialValuesMock = Symbol('any-initial-values-mock') as unknown as Record<
      string,
      string | string[]
    >;

    jest.mocked(useInstanceCreate).mockReturnValueOnce({
      initialValues: initialValuesMock,
      schema: schemaMock,
      submitHandler: submitHandlerMock,
    });

    // When
    const { container } = render(<InstanceCreatePage />);

    // Then
    expect(container).toMatchSnapshot();
    expect(DTO2FormComponent).toHaveBeenCalledOnce();
    expect(DTO2FormComponent).toHaveBeenCalledWith(
      {
        config: { id: 'DTO2Form-instance-create' },
        initialValues: initialValuesMock,
        onSubmit: submitHandlerMock,
        schema: schemaMock,
      },
      {},
    );
  });
});
