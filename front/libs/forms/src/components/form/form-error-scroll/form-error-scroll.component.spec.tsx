import { FormSpy } from 'react-final-form';

import { useScrollToElement } from '@fc/common';
import { renderWithFinalForm } from '@fc/testing-library';

import { FormErrorScrollComponent } from './form-error-scroll.component';

describe('FormErrorScrollComponent', () => {
  const scrollToMock = jest.fn();

  beforeEach(() => {
    // given
    jest.mocked(useScrollToElement).mockImplementation(() => ({ scrollToElement: scrollToMock }));
  });

  it('should match its snapshot', () => {
    // when
    const { container } = renderWithFinalForm(<FormErrorScrollComponent />);

    // then
    expect(container).toMatchSnapshot();
  });

  it('should render FormSpy mock with a subscription prop', () => {
    // when
    renderWithFinalForm(<FormErrorScrollComponent />);
    const { subscription } = jest.mocked(FormSpy).mock.calls[0][0];

    // then
    expect(subscription).toStrictEqual({
      modifiedSinceLastSubmit: true,
      submitFailed: true,
    });
  });

  it('should render FormSpy mock with a onChange prop', () => {
    // when
    renderWithFinalForm(<FormErrorScrollComponent />);
    const { onChange } = jest.mocked(FormSpy).mock.calls[0][0];

    // then
    expect(onChange).toBeInstanceOf(Function);
  });

  it('should call useScrollToElement when the component is render with classname parameter', () => {
    // when
    renderWithFinalForm(<FormErrorScrollComponent />);

    // then
    expect(useScrollToElement).toHaveBeenCalledOnce();
    expect(useScrollToElement).toHaveBeenCalledWith('.fr-message--error');
  });

  it('should call useScrollToElement when FormSpy onChange is called', () => {
    // when
    renderWithFinalForm(<FormErrorScrollComponent />);
    const { onChange } = jest.mocked(FormSpy).mock.calls[0][0] as { onChange: () => void };
    onChange();

    // then
    expect(scrollToMock).toHaveBeenCalledOnce();
  });
});
