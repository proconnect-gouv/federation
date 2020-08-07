/* istanbul ignore file */

// Native function not to be tested
export function split(separator: string | RegExp, limit?: number) {
  return (property: string) => {
    return property.split(separator, limit);
  };
}
