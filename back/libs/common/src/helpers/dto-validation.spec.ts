// Needed to use the "spyOn" method of jest
import * as ClassTransformer from 'class-transformer';
import * as ClassValidator from 'class-validator';

import {
  filteredByDto,
  getTransformed,
  validateDto,
  validateDtoSync,
} from './dto-validation';

describe('DtoValidation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getTransformed', () => {
    it('should call "plainToInstance" from "class-transformer" with the given arguments', () => {
      // setup
      jest.spyOn(ClassTransformer, 'plainToInstance');

      class TestClass {}
      const plain = { foo: 'bar' };
      const resultValidationOptions = undefined;

      // action
      getTransformed(plain, TestClass);

      // expect
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledTimes(1);
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledWith(
        TestClass,
        plain,
        resultValidationOptions,
      );
    });
  });

  describe('validateDto', () => {
    it('should call "plainToInstance" from "class-transformer" through "getTransformed" call', async () => {
      // setup
      jest.spyOn(ClassTransformer, 'plainToInstance');
      // Actual async
      // eslint-disable-next-line require-await
      jest.spyOn(ClassValidator, 'validate').mockImplementation(async () => []);

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };
      const resultValidationOptions = undefined;

      // action
      await validateDto(plain, TestClass, validationOptions);

      // expect
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledTimes(1);
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledWith(
        TestClass,
        plain,
        resultValidationOptions,
      );
    });

    it('should call "plainToInstance" from "class-transformer" through "getTransformed" call with full options', async () => {
      // setup
      jest.spyOn(ClassTransformer, 'plainToInstance');
      // Actual async
      // eslint-disable-next-line require-await
      jest.spyOn(ClassValidator, 'validate').mockImplementation(async () => []);

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };
      const transformOptions = { groups: ['hello'] };

      // action
      await validateDto(plain, TestClass, validationOptions, transformOptions);

      // expect
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledTimes(1);
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledWith(
        TestClass,
        plain,
        transformOptions,
      );
    });

    it('should call "validate" from "class-validator" with given Dto', async () => {
      // setup
      jest.spyOn(ClassValidator, 'validate');

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };

      // action
      await validateDto(plain, TestClass, validationOptions);

      // expect
      expect(ClassValidator.validate).toHaveBeenCalledTimes(1);
      expect(ClassValidator.validate).toHaveBeenCalledWith(
        plain,
        validationOptions,
      );
    });

    it('should return an empty array if no error is found', async () => {
      // setup
      jest.spyOn(ClassTransformer, 'plainToInstance');
      jest.spyOn(ClassValidator, 'validate').mockResolvedValue([]);

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };

      // action
      const errors = await validateDto(plain, TestClass, validationOptions);

      // expect
      expect(errors).toBeInstanceOf(Array);
      expect(errors.length).toStrictEqual(0);
    });

    it('should return the "validate" call result', async () => {
      // setup
      const validateResult = [
        {
          property: 'foo',
          constraints: {
            Bar: 'oops !',
            Rab: 'oops too !',
          },
          children: [],
        },
      ];

      jest.spyOn(ClassTransformer, 'plainToInstance');
      jest.spyOn(ClassValidator, 'validate').mockResolvedValue(validateResult);

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };

      // action
      const errors = await validateDto(plain, TestClass, validationOptions);

      // expect
      expect(errors).toBeInstanceOf(Array);
      expect(errors.length).toStrictEqual(1);
      expect(errors).toMatchObject(validateResult);
    });
  });

  describe('validateDtoSync', () => {
    it('should call "plainToInstance" from "class-transformer" through "getTransformed" call', () => {
      // setup
      jest.spyOn(ClassTransformer, 'plainToInstance');
      jest.spyOn(ClassValidator, 'validateSync').mockReturnValue([]);

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };
      const resultValidationOptions = undefined;

      // action
      validateDtoSync(plain, TestClass, validationOptions);

      // expect
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledTimes(1);
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledWith(
        TestClass,
        plain,
        resultValidationOptions,
      );
    });

    it('should call "plainToInstance" from "class-transformer" through "getTransformed" call with full options', () => {
      // setup
      jest.spyOn(ClassTransformer, 'plainToInstance');
      jest.spyOn(ClassValidator, 'validateSync').mockReturnValue([]);

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };
      const transformOptions = { groups: ['hello'] };

      // action
      validateDtoSync(plain, TestClass, validationOptions, transformOptions);

      // expect
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledTimes(1);
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledWith(
        TestClass,
        plain,
        transformOptions,
      );
    });

    it('should call "validateSync" from "class-validator" with given Dto', () => {
      // setup
      jest.spyOn(ClassValidator, 'validateSync');

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };

      // action
      validateDtoSync(plain, TestClass, validationOptions);

      // expect
      expect(ClassValidator.validateSync).toHaveBeenCalledTimes(1);
      expect(ClassValidator.validateSync).toHaveBeenCalledWith(
        plain,
        validationOptions,
      );
    });

    it('should return an empty array if no error is found', () => {
      // setup
      jest.spyOn(ClassTransformer, 'plainToInstance');
      jest.spyOn(ClassValidator, 'validateSync').mockReturnValue([]);

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };

      // action
      const errors = validateDtoSync(plain, TestClass, validationOptions);

      // expect
      expect(errors).toBeInstanceOf(Array);
      expect(errors.length).toStrictEqual(0);
    });

    it('should return the "validateSync" call result', () => {
      // setup
      const validateResult = [
        {
          property: 'foo',
          constraints: {
            Bar: 'oops !',
            Rab: 'oops too !',
          },
          children: [],
        },
      ];

      jest.spyOn(ClassTransformer, 'plainToInstance');
      jest
        .spyOn(ClassValidator, 'validateSync')
        .mockReturnValue(validateResult);

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };

      // action
      const errors = validateDtoSync(plain, TestClass, validationOptions);

      // expect
      expect(errors).toBeInstanceOf(Array);
      expect(errors.length).toStrictEqual(1);
      expect(errors).toMatchObject(validateResult);
    });
  });

  describe('filteredByDto', () => {
    it('should call "plainToInstance" and "instanceToPlain" from "class-transformer"', async () => {
      // setup
      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };
      const resultValidationOptions = undefined;

      jest
        .spyOn(ClassTransformer, 'plainToInstance')
        .mockReturnValueOnce(plain);
      jest.spyOn(ClassValidator, 'validate').mockResolvedValueOnce([]);
      // the spyOn choose the wrong instanceToPlain definition :(
      jest
        .spyOn(ClassTransformer, 'instanceToPlain')
        .mockReturnValueOnce(plain as any);

      // action
      const result = await filteredByDto(plain, TestClass, validationOptions);

      // expect
      expect(result).toEqual({ errors: [], result: plain });
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledTimes(1);
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledWith(
        TestClass,
        plain,
        resultValidationOptions,
      );
      expect(ClassTransformer.instanceToPlain).toHaveBeenCalledTimes(1);
      expect(ClassTransformer.instanceToPlain).toHaveBeenCalledWith(plain);
    });

    it('should call "plainToInstance" and "instanceToPlain" from "class-transformer" with full options', async () => {
      // setup
      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };
      const transformOptions = { groups: ['hello'] };

      jest.spyOn(ClassTransformer, 'plainToInstance');
      jest.spyOn(ClassValidator, 'validate').mockResolvedValueOnce([]);
      // the spyOn choose the wrong instanceToPlain definition :(
      jest
        .spyOn(ClassTransformer, 'instanceToPlain')
        .mockReturnValueOnce(plain as any);

      // action
      const result = await filteredByDto(
        plain,
        TestClass,
        validationOptions,
        transformOptions,
      );

      // expect
      expect(result).toEqual({ errors: [], result: plain });
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledTimes(1);
      expect(ClassTransformer.plainToInstance).toHaveBeenCalledWith(
        TestClass,
        plain,
        transformOptions,
      );
      expect(ClassTransformer.instanceToPlain).toHaveBeenCalledTimes(1);
      expect(ClassTransformer.instanceToPlain).toHaveBeenCalledWith(plain);
    });

    it('should call "validate" from "class-validator" with given Dto', async () => {
      // setup
      jest.spyOn(ClassValidator, 'validate');

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };

      // action
      await filteredByDto(plain, TestClass, validationOptions);

      // expect
      expect(ClassValidator.validate).toHaveBeenCalledTimes(1);
      expect(ClassValidator.validate).toHaveBeenCalledWith(
        plain,
        validationOptions,
      );
    });

    it('should return data if no error is found', async () => {
      // setup

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };

      jest.spyOn(ClassTransformer, 'plainToInstance');
      jest.spyOn(ClassValidator, 'validate').mockResolvedValue([]);
      // the spyOn choose the wrong instanceToPlain definition :(
      jest
        .spyOn(ClassTransformer, 'instanceToPlain')
        .mockReturnValueOnce(plain as any);

      // action
      const { errors, result } = await filteredByDto(
        plain,
        TestClass,
        validationOptions,
      );

      // expect
      expect(errors).toBeInstanceOf(Array);
      expect(errors.length).toStrictEqual(0);
      expect(result).toEqual(plain);
    });

    it('should return the "validate" call result', async () => {
      // setup
      const validateResult = [
        {
          children: [],
          constraints: {
            Bar: 'oops !',
            Rab: 'oops too !',
          },
          property: 'foo',
        },
      ];

      class TestClass {}
      const plain = { foo: 'bar' };
      const validationOptions = { whitelist: false };

      jest.spyOn(ClassTransformer, 'plainToInstance');
      jest.spyOn(ClassValidator, 'validate').mockResolvedValue(validateResult);
      // the spyOn choose the wrong instanceToPlain definition :(
      const instanceToPlainMock = jest
        .spyOn(ClassTransformer, 'instanceToPlain')
        .mockReturnValueOnce(plain as any);

      // action
      const { errors, result } = await filteredByDto(
        plain,
        TestClass,
        validationOptions,
      );

      // expect
      expect(errors).toBeInstanceOf(Array);
      expect(errors.length).toStrictEqual(1);
      expect(errors).toMatchObject(validateResult);
      expect(result).toEqual(null);
      expect(instanceToPlainMock).toHaveBeenCalledTimes(0);
    });
  });
});
