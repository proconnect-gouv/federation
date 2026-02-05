import { getDefaultContactHref } from './exception-display.helper';

describe('getDefaultContactHref', () => {
  it('should render href with params', () => {
    // When
    const input = { code: 'code', id: 'id', message: 'message' };

    const defaultContactHref = getDefaultContactHref(input);

    // Then
    expect(defaultContactHref).toBeString();
  });

  it('should render href without params', () => {
    // When
    const input = { code: null, id: null, message: null };

    const defaultContactHref = getDefaultContactHref(input);

    // Then
    expect(defaultContactHref).toBeString();
  });
});
