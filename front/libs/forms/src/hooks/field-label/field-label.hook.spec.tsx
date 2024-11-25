import { renderHook } from '@testing-library/react';

import { useFieldLabel } from './field-label.hook';

describe('useFieldLabel', () => {
  it('should return the label without an asterisk if not required', () => {
    // when
    const { result } = renderHook(() =>
      useFieldLabel({
        label: 'label-mock',
      }),
    );

    // then
    expect(result.current).toStrictEqual({
      hint: undefined,
      label: 'label-mock',
      required: false,
    });
  });

  it('should return the label with an asterisk if required', () => {
    // when
    const { result } = renderHook(() =>
      useFieldLabel({
        label: 'label-mock',
        required: true,
      }),
    );

    // then
    expect(result.current).toStrictEqual({
      hint: undefined,
      label: 'label-mock *',
      required: true,
    });
  });

  it('should return the label with an asterisk and a hint', () => {
    // when
    const { result } = renderHook(() =>
      useFieldLabel({
        hint: 'hint-mock',
        label: 'label-mock',
        required: true,
      }),
    );

    // then
    expect(result.current).toStrictEqual({
      hint: 'hint-mock',
      label: 'label-mock *',
      required: true,
    });
  });

  it('should return the label with an asterisk and the hint as the result of a function', () => {
    // when
    const { result } = renderHook(() =>
      useFieldLabel({
        hint: () => 'hint-mock',
        label: 'label-mock',
        required: true,
      }),
    );

    // then
    expect(result.current).toStrictEqual({
      hint: 'hint-mock',
      label: 'label-mock *',
      required: true,
    });
  });

  it('should return the label and the hint as a component', () => {
    // when
    const HintMock = <div>hint-mock</div>;

    const { result } = renderHook(() =>
      useFieldLabel({
        hint: HintMock,
        label: 'label-mock',
      }),
    );

    // then
    expect(result.current).toStrictEqual({
      hint: HintMock,
      label: 'label-mock',
      required: false,
    });
  });
});
