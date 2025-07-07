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

export function arrayToLines(value: any) {
  if (Array.isArray(value)) {
    return value.join('\r\n');
  }
  return value;
}

export function defaultNoneOrLinesToNullableArray(value: any) {
  if (!value || value === 'default') {
    return null;
  } else if (value === 'none') {
    return [];
  } else {
    return linesToArray(value);
  }
}

export function nullableArrayToDefaultNoneOrLines(value: any) {
  if (!value) {
    return 'default';
  } else if (Array.isArray(value) && value.length === 0) {
    return 'none';
  } else if (Array.isArray(value) && value.length > 0) {
    return arrayToLines(value);
  } else {
    return value;
  }
}

export function toArray(value: string | string[]) {
  return Array.isArray(value) ? value : [value];
}

export function toNullableString(value: any) {
  return value ? value : null;
}
