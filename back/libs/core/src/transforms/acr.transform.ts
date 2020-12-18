/**
 * @todo #309 ETQ que DEV, récupérer en config le niveau eidas à utiliser
 * - Remove the hard-coded eidas value.
 * - Challenge te fact that a default constant is requiered if the config is empty.
 * - Eidas is a specific value and shouldn't be placed whithin its name.
 * - Add a @MinLength decorator for the config Dto to prevent any empty object.
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/309
 */
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
