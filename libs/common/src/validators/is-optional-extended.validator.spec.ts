import { isOptionalExtended } from './is-optional-extended.validator';

describe('IsRnippBirthdate', () => {
  it('should return "false" if the value is "null"', () => {
    // setup
    const value = null;

    // action
    const valid = isOptionalExtended(value);

    // assert
    expect(valid).toStrictEqual(false);
  });

  it('should return "false" if the value is "undefined"', () => {
    // setup
    const value = undefined;

    // action
    const valid = isOptionalExtended(value);

    // assert
    expect(valid).toStrictEqual(false);
  });

  it('should return "false" if the value is ""', () => {
    // setup
    const value = '';

    // action
    const valid = isOptionalExtended(value);

    // assert
    expect(valid).toStrictEqual(false);
  });

  it('should return "true" if the value is neither "null", "undefined" or ""', () => {
    // setup
    const value = 'pouet';

    // action
    const valid = isOptionalExtended(value);

    // assert
    expect(valid).toStrictEqual(true);
  });
});
