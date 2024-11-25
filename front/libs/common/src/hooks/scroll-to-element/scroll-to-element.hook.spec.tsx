import { renderHook } from '@testing-library/react';

import { renderWithScrollToElement } from '@fc/testing-library';

import { useScrollToElement } from './scroll-to-element.hook';

describe('useScrollToElement', () => {
  const classname = '.any-classname-mock';

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should return an object with a scrollTo function', () => {
    // when
    const { result } = renderHook(() => useScrollToElement(classname));

    // then
    expect(result.current.scrollToElement).toBeInstanceOf(Function);
  });

  it('should throw an error if classname argument is undefined', () => {
    // given
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    // when
    expect(
      () =>
        renderHook(() => {
          const cssclass = undefined as unknown as string;
          return useScrollToElement(cssclass);
        }),
      // then
    ).toThrow('classname is required');
  });

  it('should call document.querySelector after a 200ms timeout with the classname in argument', () => {
    // given
    jest.useFakeTimers();
    const querySelectorSpy = jest.spyOn(document, 'querySelector');

    // when
    const { result } = renderHook(() => useScrollToElement(classname));
    result.current.scrollToElement();

    // then
    expect(querySelectorSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);

    expect(querySelectorSpy).toHaveBeenCalledWith(classname);
  });

  it('should not call scrollIntoView if parent element do not exist', () => {
    // given
    jest.useFakeTimers();
    jest
      .spyOn(document, 'querySelector')
      .mockImplementation(() => undefined as unknown as HTMLElement);
    const scrollIntoViewMock = jest.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    // when
    const { result } = renderWithScrollToElement(
      () => useScrollToElement(classname),
      classname.slice(1),
    );
    result.current.scrollToElement();

    // then
    jest.advanceTimersByTime(200);

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it('should call scrollIntoView if scrollBehavior is supported', () => {
    // given
    jest.useFakeTimers();

    const scrollIntoViewMock = jest.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    const scrollBySpy = jest.spyOn(window, 'scrollBy').mockImplementation(() => jest.fn());

    // when
    const { result } = renderWithScrollToElement(
      () => useScrollToElement(classname),
      classname.slice(1),
    );
    result.current.scrollToElement();

    // then
    jest.advanceTimersByTime(200);

    expect(scrollBySpy).not.toHaveBeenCalled();
    expect(scrollIntoViewMock).toHaveBeenCalledOnce();
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('should call window.scrollBy if scrollBehavior is not supported', () => {
    // given
    jest.useFakeTimers();
    const topPositionMock = 100;
    const scrollBySpy = jest.spyOn(window, 'scrollBy').mockImplementation(() => jest.fn());
    document.documentElement.scrollIntoView = undefined as unknown as () => void;
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => ({ top: topPositionMock }) as DOMRect);

    // when
    const { result } = renderWithScrollToElement(
      () => useScrollToElement(classname),
      classname.slice(1),
    );
    result.current.scrollToElement();

    // then
    jest.advanceTimersByTime(500);

    expect(scrollBySpy).toHaveBeenCalledOnce();
    expect(scrollBySpy).toHaveBeenCalledWith({ behavior: 'smooth', left: 0, top: 100 });
  });
});
