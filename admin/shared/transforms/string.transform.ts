import * as moment from 'moment-timezone';

export function toDate(format: string) {
  const requiredDateFormat = 'YYYY-MM-DD';
  return (value: string): Date => {
    if (format !== requiredDateFormat) {
      return undefined;
    }
    return moment(value, format).toDate();
  };
}

export function toBoolean(value: string): boolean | undefined {
  switch (value) {
    case 'true':
    case 'on':
    case '1':
    case 'yes':
      return true;
    case 'false':
    case 'off':
    case '0':
    case 'no':
      return false;
    default:
      return undefined;
  }
}

export function linesToArray(value: string): string[] | undefined {
  let result: string[];
  try {
    result = value
      .split(/\r\n|\n|\r|[;]/)
      .map((v: string) => v.trim())
      .filter((v: string) => Boolean(v));
  } catch (e) {
    return undefined;
  }
  return result;
}

/**
 * Force the input to be an array in DTO
 * @param {string | unknown[]} value
 */
export function toArray(value: string | string[]) {
  return Array.isArray(value) ? value : [value];
}
