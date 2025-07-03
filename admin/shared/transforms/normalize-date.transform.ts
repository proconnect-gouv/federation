import { Transform } from 'class-transformer';

export function normalizeDate(value) {
  if (value.match(/^\d{4}/)) {
    return value;
  }

  return value
    .split(/[-/]/)
    .reverse()
    .join('-');
}

// This function is declarative and has no logic itself
/* eslint disable-next */
export function NormalizeDate() {
  return Transform(normalizeDate);
}
