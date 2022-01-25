export function enforceArray({ value }) {
  return Array.isArray(value) ? value : [value];
}
