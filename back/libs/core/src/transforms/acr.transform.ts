// Oidc naming convention
// eslint-disable-next-line @typescript-eslint/naming-convention
export type AcrValues = Partial<{ acr_values: any }>;

export function pickAcr(
  allowed: string[],
  values: string[],
  defaultAcr: string,
): string {
  if (!allowed.length) {
    return defaultAcr;
  }

  /**
   * @note Items inside `allowed` parameter (eidas levels)
   * should be ordered from weakest to strongest
   */
  const intersection = values.filter((acr) => allowed.includes(acr));
  const hasCommonValues = Boolean(intersection.length);
  if (hasCommonValues) {
    const lowestEidasValue = intersection.shift();
    return lowestEidasValue;
  }

  /**
   * Array.from() is necessary to copy the array since allowed is a parameter
   * We do not want to mutate the given parameters
   */
  const highestEidasValue = Array.from(allowed).pop();
  return highestEidasValue;
}
