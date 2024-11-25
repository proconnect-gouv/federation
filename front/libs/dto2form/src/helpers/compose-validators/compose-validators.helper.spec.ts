import type { FieldState } from 'final-form';

import { composeValidators } from './compose-validators.helper';

describe('composeValidators', () => {
  it('should call all the validators', () => {
    // given
    const valueMock = Symbol('value mock') as unknown as string;
    const allValuesMock = Symbol('allValues mock') as unknown as object;
    const metaMock = Symbol('meta mock') as unknown as FieldState<string>;

    const validatorMock1 = jest.fn();
    const validatorMock2 = jest.fn();

    // when
    const validators = composeValidators(validatorMock1, validatorMock2);
    validators(valueMock, allValuesMock, metaMock);

    // then
    expect(validatorMock1).toHaveBeenCalledOnce();
    expect(validatorMock1).toHaveBeenCalledWith(valueMock, allValuesMock, metaMock);
    expect(validatorMock2).toHaveBeenCalledOnce();
    expect(validatorMock2).toHaveBeenCalledWith(valueMock, allValuesMock, metaMock);
  });

  it('should return undefined when all validators pass', () => {
    // given
    const valueMock = Symbol('value mock') as unknown as string;
    const validatorMock1 = jest.fn().mockReturnValueOnce(undefined);

    // when
    const validators = composeValidators(validatorMock1);
    const result = validators(valueMock, {}, undefined);

    // then
    expect(result).toBeUndefined();
  });

  it('should return an error message on first validator fail', () => {
    // given
    const valueMock = Symbol('value mock') as unknown as string;
    const validatorsStackMock = [
      jest.fn(() => undefined),
      jest.fn(() => 'error message mock'),
      jest.fn(() => undefined),
    ];

    // when
    const validators = composeValidators(...validatorsStackMock);
    const result = validators(valueMock, {}, undefined);

    // then
    expect(result).toBe('error message mock');
    expect(validatorsStackMock[0]).toHaveBeenCalledOnce();
    expect(validatorsStackMock[1]).toHaveBeenCalledOnce();
    expect(validatorsStackMock[2]).not.toHaveBeenCalled();
  });
});
