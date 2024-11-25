import { render } from '@testing-library/react';

import type { JSONFieldType } from '@fc/dto2form';
import { DTO2FormComponent } from '@fc/dto2form';

import { useVersionCreate } from '../../../../hooks';
import { VersionCreatePage } from './version-create.page';

jest.mock('../../../../hooks/version-create/version-create.hook');

describe('versionCreatePage', () => {
  it('should match the snapshot', () => {
    // Given
    const submitHandlerMock = jest.fn();
    const schemaMock = Symbol('any-schema-mock') as unknown as JSONFieldType[];

    jest
      .mocked(useVersionCreate)
      .mockReturnValueOnce({ schema: schemaMock, submitHandler: submitHandlerMock });

    // When
    const { container } = render(<VersionCreatePage />);

    // Then
    expect(container).toMatchSnapshot();
    expect(DTO2FormComponent).toHaveBeenCalledOnce();
    expect(DTO2FormComponent).toHaveBeenCalledWith(
      {
        config: { id: 'DTO2Form.version.create' },
        initialValues: {},
        onSubmit: submitHandlerMock,
        schema: schemaMock,
      },
      {},
    );
  });
});
