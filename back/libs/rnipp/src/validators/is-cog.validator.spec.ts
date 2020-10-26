import { validateCog } from './is-cog.validator';

describe('IsRnippBirthdate', () => {
  it('should return "false" if the argument is not a string', () => {
    // setup
    const notAstring = 42;

    // action
    const valid = validateCog(notAstring);

    // assert
    expect(valid).toStrictEqual(false);
  });

  it('should return "true" if the argument is a valid cog', () => {
    // setup
    const cog = '95277';

    // action
    const valid = validateCog(cog);

    // assert
    expect(valid).toStrictEqual(true);
  });

  it('should return "false" if the argument is not a valid cog', () => {
    // setup
    const cog = 'nop';

    // action
    const valid = validateCog(cog);

    // assert
    expect(valid).toStrictEqual(false);
  });
});
