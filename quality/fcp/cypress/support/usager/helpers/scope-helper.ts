import { ScopeContext } from '../../common/types';

/*
Alias definition:
- profile : Regroupe les scopes given_name, family_name, birthdate et gender. Si disponible, renvoie aussi preferred_username
- birth : Regroupe les scopes birthplace et birthcountry. Permet de récupérer la ville et le département de naissance de la personne.
- identite_pivot : Regroupe les scopes profile et birth. Permet de récupérer l'identité pivot complète plus le nom d'usage si disponible.
*/
const aliasScopesClaims = {
  birth: ['birthplace', 'birthcountry'],
  identite_pivot: [
    'birthcountry',
    'birthdate',
    'birthplace',
    'family_name',
    'gender',
    'given_name',
  ],
  openid: ['sub'],
  phone: ['phone_number'],
  profile: [
    'birthdate',
    'family_name',
    'gender',
    'given_name',
    'preferred_username',
  ],
};

/**
 * Get the claims matching the scopes
 * @param scopeContext scope context requested by the service provider
 * @returns an array with corresponding claims
 */
export const getClaims = (scopeContext: ScopeContext): string[] => {
  const { scopes } = scopeContext;
  const claims = scopes
    .map((scope: string): string =>
      aliasScopesClaims[scope] ? aliasScopesClaims[scope] : scope,
    )
    .flat();
  return [...new Set(claims)];
};
