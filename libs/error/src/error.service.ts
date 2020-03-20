import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FcException, HttpException } from './interfaces';

/**
 * Global core v2 Error prefix
 *
 * "Y" was a random choice to be different from legacy core ("E")
 * We actually ran pwgen and got the first letter.
 * But let's build some story telling and say it is intended to say "why?"
 */
const ERROR_PREFIX = 'Y';

@Injectable()
export class ErrorService {
  static getExceptionCodeFor<T>(exception?: T): string {
    let scope = 0;
    let code = 0;

    if (exception instanceof FcException) {
      scope = exception.scope;
      code = exception.code;
    } else if (exception instanceof HttpException) {
      code = exception.getStatus();
    }

    return ErrorService.getCode(scope, code);
  }

  // simple wrapper
  // instanbul ignore next line
  static generateErrorId(): string {
    return uuidv4();
  }

  private static getCode(scope: number, code: number): string {
    const scopeString = ErrorService.addLeadingZeros(scope, 2);
    const codeString = ErrorService.addLeadingZeros(code, 4);

    return `${ERROR_PREFIX}${scopeString}${codeString}`;
  }

  private static addLeadingZeros(value: number, length: number): string {
    return `${value}`.padStart(length, '0');
  }
}
