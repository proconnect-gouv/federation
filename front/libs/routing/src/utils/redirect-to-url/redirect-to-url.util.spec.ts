import { RedirectException } from '../../exceptions';
import { redirectToUrl } from './redirect-to-url.util';

describe('redirectToUrl', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { assign: jest.fn() },
      writable: true,
    });
  });

  it('should throw an RedirectException if the url is empty', () => {
    // when/then
    expect(() => redirectToUrl('')).toThrow(RedirectException);
  });

  it('should throw an RedirectException if the url is undefined', () => {
    // when/then
    expect(() => redirectToUrl(undefined as unknown as string)).toThrow(RedirectException);
  });

  it('should throw an RedirectException if the url is an empty string', () => {
    // when/then
    expect(() => redirectToUrl('                ')).toThrow(RedirectException);
  });

  it('should call window.location.href with the given url', () => {
    // given
    const url = 'http://mock-url.com';

    // when
    redirectToUrl(url);

    // then
    expect(window.location.href).toBe('http://mock-url.com/');
  });

  it('should call window.location.href with an encoded url', () => {
    // given
    const url =
      'http://mock-url.com/ with spaces / and /slashes /?query=string&param= super mega cool';

    // when
    redirectToUrl(url);

    // then
    expect(window.location.href).toBe(
      'http://mock-url.com/%20with%20spaces%20/%20and%20/slashes%20/?query=string&param=%20super%20mega%20cool',
    );
  });
});
