import { ConfigService } from '@fc/config';
import { IsValidPromptConstraint } from './prompt.validator';

describe('IsValidPromptConstraint', () => {
  let constraint;

  const configMock = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();

    configMock.get.mockReturnValueOnce({
      forcedPrompt: ['boots', 'clothes', 'motorcycle'],
    });

    constraint = new IsValidPromptConstraint(
      (configMock as unknown) as ConfigService,
    );
  });

  describe('validate', () => {
    it('should return "true" if the array include one of the values allowed', () => {
      // setup
      const value = ['clothes'];
      const validationArguments = {};

      // action
      const valid = constraint.validate(value, validationArguments);

      // assert
      expect(valid).toStrictEqual(true);
    });

    it('should return "true" if the value include two of the values allowed', () => {
      // setup
      const value = ['boots', 'motorcycle'];
      const validationArguments = {};

      // action
      const valid = constraint.validate(value, validationArguments);

      // assert
      expect(valid).toStrictEqual(true);
    });

    it('should return "true" if the value include all the values allowed', () => {
      // setup
      const value = ['boots', 'clothes', 'motorcycle'];
      const validationArguments = {};

      // action
      const valid = constraint.validate(value, validationArguments);

      // assert
      expect(valid).toStrictEqual(true);
    });

    it('should return "true" if the value include one of the values allowed plus another unknown', () => {
      // setup
      const value = ['clothes', 'SarahConnor'];
      const validationArguments = {};

      // action
      const valid = constraint.validate(value, validationArguments);

      // assert
      expect(valid).toStrictEqual(true);
    });

    it('should return "false" if the value none of the values allowed', () => {
      // setup
      const value = ['I will be back 👍'];
      const validationArguments = {};

      // action
      const valid = constraint.validate(value, validationArguments);

      // assert
      expect(valid).toStrictEqual(false);
    });

    it('should return "false" the value is not an array', () => {
      // setup
      const value = 'Not an array';
      const validationArguments = {};

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
      };

      // action
      const message = constraint.defaultMessage(validationArguments);

      // assert
      expect(message).toStrictEqual(
        'prompt allows only theses values: "boots, clothes, motorcycle", got: "I, will, be, back 👍"',
      );
    });
  });
});
