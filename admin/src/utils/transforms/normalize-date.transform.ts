import { Transform } from 'class-transformer';

export function normalizeDate(value) {
  if (value.match(/^\d{4}/)) {
    return value;
  }

  return value.split(/[-/]/).reverse().join('-');
}
