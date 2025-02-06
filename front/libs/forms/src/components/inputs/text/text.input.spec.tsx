import { render } from '@testing-library/react';

import { useFieldMeta } from '../../../hooks';
import type { PropsWithInputConfigType } from '../../../types';
import { GroupElement, InputTextElement, LabelElement, MessageElement } from '../../elements';
import { TextInput } from './text.input';

jest.mock('../../elements/group/group.element');
jest.mock('../../elements/label/label.element');
jest.mock('../../elements/message/message.element');
jest.mock('../../elements/input-text/input-text.element');
jest.mock('../../../hooks/field-meta/field-meta.hook');

describe('TextInput', () => {
  it('should match snapshot', () => {
    // Given
    jest.mocked(useFieldMeta).mockReturnValue({
      errorMessage: 'any-errorMessage-mock',
      hasError: true,
      inputClassname: 'any-inputClassname-mock',
      isValid: true,
    });

    const propsMock = {
      config: {
        hint: 'any-hint-mock',
        label: 'any-label-mock',
      },
      input: {
        className: 'any-classname-mock',
        disabled: true,
        name: 'any-name-mock',
        type: 'text',
        value: 'any-input-value-mock',
      },
      meta: {
        error: 'any-errorMessage-mock',
        touched: false,
        value: 'any-input-value-mock',
      },
    } as unknown as PropsWithInputConfigType<string>;

    // When
    const { container } = render(<TextInput {...propsMock} />);

    // Then
    expect(container).toMatchSnapshot();
    expect(useFieldMeta).toHaveBeenCalledOnce();
    expect(useFieldMeta).toHaveBeenCalledWith({
      error: 'any-errorMessage-mock',
      touched: false,
      value: 'any-input-value-mock',
    });
    expect(GroupElement).toHaveBeenCalledOnce();
    expect(GroupElement).toHaveBeenCalledWith(
      {
        children: expect.any(Array),
        className: 'any-classname-mock',
        disabled: true,
        hasError: true,
        isValid: true,
        type: 'input',
      },
      {},
    );
    expect(LabelElement).toHaveBeenCalledOnce();
    expect(LabelElement).toHaveBeenCalledWith(
      {
        hint: 'any-hint-mock',
        label: 'any-label-mock',
        name: 'any-name-mock',
      },
      {},
    );
    expect(InputTextElement).toHaveBeenCalledOnce();
    expect(InputTextElement).toHaveBeenCalledWith(
      {
        className: 'any-inputClassname-mock',
        disabled: true,
        id: 'form-input-text-any-name-mock',
        input: propsMock.input,
      },
      {},
    );
    expect(MessageElement).toHaveBeenCalledOnce();
    expect(MessageElement).toHaveBeenCalledWith(
      {
        dataTestId: 'any-name-mock-messages',
        error: 'any-errorMessage-mock',
        id: 'any-name-mock',
        isValid: true,
      },
      {},
    );
  });
});
