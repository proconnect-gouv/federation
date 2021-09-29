import {
  concatApplicationRoutes,
  checkIsPagePath,
} from './concat-application-routes';
import { generics, homepage, notfound } from './routes.mock';
import sortRouteByPathDesc from './sort-route-by-path';

jest.mock('./sort-route-by-path');

describe('checkIsPagePath', () => {
  it('should not throw if path is equal expected', () => {
    // then
    expect(() => {
      checkIsPagePath('/any-path', '/any-path');
    }).not.toThrow();
  });

  it('should throw if path is not equal expected', () => {
    // then
    expect(() => {
      checkIsPagePath('/any-path', '/expected-path');
    }).toThrow(
      "Page path is not valid, expected '/expected-path' got '/any-path'",
    );
  });
});

describe('concatApplicationRoutes', () => {
  it('should throw if notfound path is not a valid path', () => {
    // given
    const invalid = { ...notfound, path: '/not-valid' };
    // then
    expect(() => {
      concatApplicationRoutes(invalid, homepage, generics);
    }).toThrow();
  });

  it('should throw if homepage path is not a valid path', () => {
    // given
    const invalid = { ...notfound, path: '/not-valid' };
    // then
    expect(() => {
      concatApplicationRoutes(notfound, invalid, generics);
    }).toThrow();
  });

  it('should not throw if homepage and notfound paths are valids', () => {
    // then
    expect(() => {
      concatApplicationRoutes(notfound, homepage, generics);
    }).not.toThrow();
  });

  it('should not mutate generics array', () => {
    // when
    concatApplicationRoutes(notfound, homepage, generics);
    const results = concatApplicationRoutes(notfound, homepage, generics);
    // then
    const len = generics.length;
    expect(results).toHaveLength(len + 2);
  });

  it('should have called sortRouteByPathDesc 5 times', () => {
    // when
    concatApplicationRoutes(notfound, homepage, generics);
    // then
    const len = generics.length;
    expect(sortRouteByPathDesc).toHaveBeenCalledTimes(len - 1);
  });

  it('should return homepage and notfound entries as last entries', () => {
    // when
    const results = concatApplicationRoutes(notfound, homepage, generics);
    // then
    const len = results.length;
    expect(results[len - 2].path).toStrictEqual(homepage.path);
    expect(results[len - 1].path).toStrictEqual(notfound.path);
  });
});
