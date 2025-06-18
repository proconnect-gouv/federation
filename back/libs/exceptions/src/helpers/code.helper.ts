import { v4 as uuid } from 'uuid';

export function getCode(scope: number, code: string | number, prefix: string = 'Y'): string {
  const scopeString = addLeadingZeros(scope, 2);
  const codeString = addLeadingZeros(code, 4);

  return `${prefix}${scopeString}${codeString}`;
}

export function addLeadingZeros(
  value: string | number,
  length: number,
): string {
  if (typeof value === 'string') {
    return value;
  }

  return `${value}`.padStart(length, '0');
}

export function generateErrorId(): string {
  return uuid();
}
