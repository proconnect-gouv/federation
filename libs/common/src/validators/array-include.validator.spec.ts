import {
  arrayInclude,
  ArrayIncludesConstraint,
} from './array-include.validator';

describe('arrayInclude', () => {
  it('should return "true" if the array include one of the values allowed', () => {
    // setup
    const array = ['clothes'];
    const allowed = ['boots', 'clothes', 'motorcycle'];

    // action
    const valid = arrayInclude(array, allowed);

    // assert
    expect(valid).toStrictEqual(true);
  });

  it('should return "true" if the array include two of the values allowed', () => {
    // setup
    const array = ['boots', 'motorcycle'];
    const allowed = ['boots', 'clothes', 'motorcycle'];

    // action
    const valid = arrayInclude(array, allowed);

    // assert
    expect(valid).toStrictEqual(true);
  });

  it('should return "true" if the array include all the values allowed', () => {
    // setup
    const array = ['boots', 'clothes', 'motorcycle'];
    const allowed = ['boots', 'clothes', 'motorcycle'];

    // action
    const valid = arrayInclude(array, allowed);

    // assert
    expect(valid).toStrictEqual(true);
  });

  it('should return "true" if the array include one of the values allowed plus another unknown', () => {
    // setup
    const array = ['clothes', 'SarahConnor'];
    const allowed = ['boots', 'clothes', 'motorcycle'];

    // action
    const valid = arrayInclude(array, allowed);

    // assert
    expect(valid).toStrictEqual(true);
  });

  it('should return "false" if the array none of the values allowed', () => {
    // setup
    const array = ['I will be back 👍'];
    const allowed = ['boots', 'clothes', 'motorcycle'];

    // action
    const valid = arrayInclude(array, allowed);

    // assert
    expect(valid).toStrictEqual(false);
  });
});

describe('ArrayIncludesConstraint', () => {
  let constraint;

  beforeEach(() => {
    constraint = new ArrayIncludesConstraint();
  });

  describe('validate', () => {
    it('should return "true" if the array include one of the values allowed', () => {
      // setup
      const value = ['clothes'];
      const validationArguments = {
        constraints: [['boots', 'clothes', 'motorcycle']],
      };

      // action
      const valid = constraint.validate(value, validationArguments);

      // assert
      expect(valid).toStrictEqual(true);
    });

    it('should return "true" if the value include two of the values allowed', () => {
      // setup
      const value = ['boots', 'motorcycle'];
      const validationArguments = {
        constraints: [['boots', 'clothes', 'motorcycle']],
      };

      // action
      const valid = constraint.validate(value, validationArguments);

      // assert
      expect(valid).toStrictEqual(true);
    });

    it('should return "true" if the value include all the values allowed', () => {
      // setup
      const value = ['boots', 'clothes', 'motorcycle'];
      const validationArguments = {
        constraints: [['boots', 'clothes', 'motorcycle']],
      };

      // action
      const valid = constraint.validate(value, validationArguments);

      // assert
      expect(valid).toStrictEqual(true);
    });

    it('should return "true" if the value include one of the values allowed plus another unknown', () => {
      // setup
      const value = ['clothes', 'SarahConnor'];
      const validationArguments = {
        constraints: [['boots', 'clothes', 'motorcycle']],
      };

      // action
      const valid = constraint.validate(value, validationArguments);

      // assert
      expect(valid).toStrictEqual(true);
    });

    it('should return "false" if the value none of the values allowed', () => {
      // setup
      const value = ['I will be back 👍'];
      const validationArguments = {
        constraints: [['boots', 'clothes', 'motorcycle']],
      };

      // action
      const valid = constraint.validate(value, validationArguments);

      // assert
      expect(valid).toStrictEqual(false);
    });

    it('should return "false" the value is not an array', () => {
      // setup
      const value = 'Not an array';
      const validationArguments = {
        constraints: [['boots', 'clothes', 'motorcycle']],
      };

      // action
      const valid = constraint.validate(value, validationArguments);

      // assert
      expect(valid).toStrictEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return return a formatted error message', () => {
      // setup
      const validationArguments = {
        value: ['I', 'will', 'be', 'back 👍'],
        property: 'property',
        constraints: [['boots', 'clothes', 'motorcycle']],
      };

      // action
      const message = constraint.defaultMessage(validationArguments);

      // assert
      expect(message).toStrictEqual(
        'property allows only theses values: "boots, clothes, motorcycle", got: "I, will, be, back 👍"',
      );
    });
  });
});
