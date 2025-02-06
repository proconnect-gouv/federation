import { renderHook } from '@testing-library/react';
import classnames from 'classnames';
import type { FieldInputProps } from 'react-final-form';
import { useField } from 'react-final-form';

import { useArrayFieldMeta } from './array-field-meta.hook';

// Given
jest.mock('classnames', () => jest.fn());

describe('useArrayFieldMeta', () => {
  // Given
  const validateMock = jest.fn();
  const classnamesMock = Symbol('classnames') as unknown as string;
  const inputMock = {} as unknown as FieldInputProps<string, HTMLElement>;

  const metaMock = {
    error: undefined,
    pristine: true,
    submitError: undefined, // 'any-submit-error-message-mock',
    touched: false,
    valid: true,
  };

  beforeEach(() => {
    // Given
    jest.mocked(classnames).mockReturnValue(classnamesMock);
    jest.mocked(useField).mockReturnValue({
      input: inputMock,
      meta: metaMock,
    });
  });

  it('should return default props', () => {
    // When
    const { result } = renderHook(() =>
      useArrayFieldMeta({ fieldName: 'any-field-name-mock', index: 0, validate: validateMock }),
    );

    // Then
    expect(useField).toHaveBeenCalledOnce();
    expect(useField).toHaveBeenCalledWith('any-field-name-mock', { validate: validateMock });
    expect(classnames).toHaveBeenCalledOnce();
    expect(classnames).toHaveBeenCalledWith('fr-input', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'fr-input--error': false,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'fr-input--valid': false,
    });
    expect(result.current).toStrictEqual({
      errorMessage: undefined,
      hasError: false,
      input: inputMock,
      inputClassname: classnamesMock,
      isValid: false,
    });
  });

  it('should return props when the field has error', () => {
    // Given
    jest.mocked(useField).mockReturnValue({
      input: inputMock,
      meta: { ...metaMock, error: 'any-error-message-mock', touched: true, valid: false },
    });
    // When
    const { result } = renderHook(() =>
      useArrayFieldMeta({ fieldName: 'any-field-name-mock', index: 0, validate: validateMock }),
    );

    // Then
    expect(classnames).toHaveBeenCalledOnce();
    expect(classnames).toHaveBeenCalledWith('fr-input', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'fr-input--error': true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'fr-input--valid': false,
    });
    expect(result.current).toStrictEqual({
      errorMessage: 'any-error-message-mock',
      hasError: true,
      input: inputMock,
      inputClassname: classnamesMock,
      isValid: false,
    });
  });

  it('should return props when the field has submit error', () => {
    // Given
    jest.mocked(useField).mockReturnValueOnce({
      input: inputMock,
      meta: {
        ...metaMock,
        submitError: 'any-submit-error-message-mock',
        touched: true,
        valid: false,
      },
    });
    // When
    const { result } = renderHook(() =>
      useArrayFieldMeta({ fieldName: 'any-field-name-mock', index: 0, validate: validateMock }),
    );

    // Then
    expect(classnames).toHaveBeenCalledOnce();
    expect(classnames).toHaveBeenCalledWith('fr-input', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'fr-input--error': true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'fr-input--valid': false,
    });
    expect(result.current).toStrictEqual({
      errorMessage: 'any-submit-error-message-mock',
      hasError: true,
      input: inputMock,
      inputClassname: classnamesMock,
      isValid: false,
    });
  });

  it('should return props when the field is valid', () => {
    // Given
    jest.mocked(useField).mockReturnValueOnce({
      input: inputMock,
      meta: { ...metaMock, pristine: false, submitError: undefined, touched: true, valid: true },
    });
    // When
    const { result } = renderHook(() =>
      useArrayFieldMeta({ fieldName: 'any-field-name-mock', index: 0, validate: validateMock }),
    );

    // Then
    expect(classnames).toHaveBeenCalledOnce();
    expect(classnames).toHaveBeenCalledWith('fr-input', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'fr-input--error': false,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'fr-input--valid': true,
    });
    expect(result.current).toStrictEqual({
      errorMessage: undefined,
      hasError: false,
      input: inputMock,
      inputClassname: classnamesMock,
      isValid: true,
    });
  });
});
