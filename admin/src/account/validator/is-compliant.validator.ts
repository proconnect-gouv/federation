import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UNAUTHORIZED } from './unauthorized';

const VALIDATOR_NAME = 'IsCompliant';

const MIN_LENGTH_CONSTRAINT = 12;
const MAX_LENGTH_CONSTRAINT = 72;
const UPPERCASE_CONSTRAINT = /[A-Z]/;
const LOWERCASE_CONSTRAINT = /[a-z]/;
const NUMBER_CONSTRAINT = /[0-9]/;
const SPECIAL_CONSTRAINT = /[^a-zA-Z0-9\s]/;

@ValidatorConstraint()
export class IsPasswordCompliant implements ValidatorConstraintInterface {
  validate(password: any) {
    if (!password) {
      return false;
    }

    if (typeof password !== 'string') {
      return false;
    }

    if (password.length < MIN_LENGTH_CONSTRAINT) {
      return false;
    }

    if (password.length > MAX_LENGTH_CONSTRAINT) {
      return false;
    }

    if (!password.match(UPPERCASE_CONSTRAINT)) {
      return false;
    }

    if (!password.match(LOWERCASE_CONSTRAINT)) {
      return false;
    }

    if (!password.match(NUMBER_CONSTRAINT)) {
      return false;
    }

    if (!password.match(SPECIAL_CONSTRAINT)) {
      return false;
    }

    if (IsPasswordCompliant.hasRecurrentPattern(password, 3)) {
      return false;
    }

    if (IsPasswordCompliant.hasEasyToGuessPatterns(password)) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Le mot de passe est invalide.';
  }

  static hasRecurrentPattern(password: string, patternLength: number) {
    const patterns = [];
    const maxIndex = password.length - patternLength;
    for (let index = 0; index < maxIndex; index += 1) {
      patterns.push(password.substring(index, index + patternLength));
    }

    const occurringMoreThanOnce = patterns.filter(
      pattern => password.split(pattern).length !== 2,
    );
    return occurringMoreThanOnce.length > 0;
  }

  static hasEasyToGuessPatterns(password) {
    if (IsPasswordCompliant.hasUnhauthorizedCaractersChain(password)) {
      return true;
    }

    if (IsPasswordCompliant.hasRepeteadCharacters(password)) {
      return true;
    }

    if (IsPasswordCompliant.hasCharactersFollowingEachOther(password)) {
      return true;
    }

    return false;
  }

  static hasUnhauthorizedCaractersChain(password) {
    const unauthorized = UNAUTHORIZED;
    return unauthorized
      .map(word => password.includes(word))
      .reduce((acc, val) => acc || val);
  }

  static hasRepeteadCharacters(password) {
    const passwordLength = password.length - 2;
    for (let char = 0; char < passwordLength; char += 1) {
      if (
        password[char] === password[char + 1] &&
        password[char] === password[char + 2]
      ) {
        return true;
      }
    }

    return false;
  }

  static hasCharactersFollowingEachOther(password) {
    const passwordLength = password.length - 2;
    const lowerCasePassword = password.toLowerCase();
    for (let char = 0; char < passwordLength; char += 1) {
      const isNumber = 48 <= char && char <= 57;
      const isLowerCaseLetter = 97 <= char && char <= 122;

      if (isNumber || isLowerCaseLetter) {
        const currCharCode = lowerCasePassword[char].charCodeAt(0);
        const nextCharCode = lowerCasePassword[char + 1].charCodeAt(0);
        const secondNextCharCode = lowerCasePassword[char + 2].charCodeAt(0);
        return (
          currCharCode + 1 === nextCharCode &&
          currCharCode + 2 === secondNextCharCode
        );
      }
    }
    return false;
  }
}

export function IsCompliant(validationOptions?: ValidationOptions) {
  return ({ constructor }: any, password: string) => {
    registerDecorator({
      name: VALIDATOR_NAME,
      target: constructor,
      propertyName: password,
      constraints: [],
      options: validationOptions,
      validator: IsPasswordCompliant,
    });
  };
}
