import { IsPasswordCompliant } from './is-compliant.validator';

describe('IsCompliant', () => {
  const validator = new IsPasswordCompliant();

  it('should throw no errors if the password is valid', () => {
    const password = 'GoodOne@buddy123';
    const result = validator.validate(password);
    expect(result).toEqual(true);
  });

  it('should throw an errors if the password is not a string', () => {
    const result = validator.validate(123);
    expect(result).toEqual(false);
  });

  it('should throw an errors if the password is too short', () => {
    const password = 'Bad@bad12';
    const result = validator.validate(password);
    expect(result).toEqual(false);
  });

  it('should throw an errors if the password is too long', () => {
    const password =
      'BadOne@BadOne123456789BadOne@BadOne123456789BadOne@BadOne123456789BadOne@BadOne123456789';
    const result = validator.validate(password);
    expect(result).toEqual(false);
  });

  it('should throw an errors if the password does not contain upper case letters', () => {
    const password = 'badone@tryagainbuddy123';
    const result = validator.validate(password);
    expect(result).toEqual(false);
  });

  it('should throw an errors if the password does not contain lower case letters', () => {
    const password = 'BADONE@TRYAGAINBUDDY123';
    const result = validator.validate(password);
    expect(result).toEqual(false);
  });

  it('should throw an errors if the password does not contain numbers', () => {
    const password = 'BadOne@TryAgainBuddy';
    const result = validator.validate(password);
    expect(result).toEqual(false);
  });

  it('should throw an errors if the password does not contain special characters', () => {
    const password = 'BadOneTryAgainBuddy123';
    const result = validator.validate(password);
    expect(result).toEqual(false);
  });

  it('should throw an errors if the password has recurrent patterns', () => {
    const password = '123BadOne@TryAgainBuddy123';
    const result = validator.validate(password);
    expect(result).toEqual(false);
  });
});

describe('hasRecurrentPattern', () => {
  it('should find a recurrent pattern', () => {
    // given
    const password = '123Hugues123Yolo!!';
    // when
    const result = IsPasswordCompliant.hasRecurrentPattern(password, 3);
    // then
    expect(result).toEqual(true);
  });

  it('should find a recurrent pattern', () => {
    // given
    const password = '123123';
    // when
    const result = IsPasswordCompliant.hasRecurrentPattern(password, 3);
    // then
    expect(result).toEqual(true);
  });

  it('should find several recurrent patterns', () => {
    // given
    const password = '123Hugues123Yolo!!HuguesYolo??';
    // when
    const result = IsPasswordCompliant.hasRecurrentPattern(password, 3);
    // then
    expect(result).toEqual(true);
  });

  it('should not find a recurrent pattern', () => {
    // given
    const password = '123Azerty!!';
    // when
    const result = IsPasswordCompliant.hasRecurrentPattern(password, 3);
    // then
    expect(result).toEqual(false);
  });

  it('should not detect patterns shorter than 3 characters', () => {
    // given
    const password = '12Hu123Yo!HuYo?';
    // when
    const result = IsPasswordCompliant.hasRecurrentPattern(password, 3);
    // then
    expect(result).toEqual(false);
  });
});
