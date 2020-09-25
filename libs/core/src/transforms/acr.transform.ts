export const DEFAULT_EIDAS = 'eidas1';

// Oidc naming convention
// eslint-disable-next-line @typescript-eslint/naming-convention
export type AcrValues = Partial<{ acr_values: any }>;

export function pickAcr(allowed: string[], values: string[]): string {
  const config = allowed.map((acr) => acr.toLowerCase());
  const inputs = values.map((acr) => acr.toLowerCase());

  const intersection = inputs.filter((acr) => config.includes(acr));
  return intersection.length
    ? intersection.sort().shift() // the lowest eidas
    : config.sort().pop() || DEFAULT_EIDAS; // the highest eidas
}
