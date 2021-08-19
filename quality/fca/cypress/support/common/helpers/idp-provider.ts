import { IdentityProvider } from '../../common/types';

const DEFAULT_IDP_DESCRIPTION = 'par défaut';

export const getIdentityProviderByAcrValue = (
  identityProviders: IdentityProvider[],
  acrValue: string,
): IdentityProvider => {
  const identityProvider: IdentityProvider = identityProviders.find(
    (identityProvider) =>
      identityProvider.acrValues.includes(acrValue) && identityProvider.enabled,
  );
  expect(
    identityProvider,
    `No active identity provider has acrValue ${acrValue}`,
  ).to.exist;
  cy.wrap(identityProvider).as('identityProvider');
  return identityProvider;
};

export const getIdentityProviderByDescription = (
  identityProviders: IdentityProvider[],
  description: string,
): IdentityProvider => {
  const identityProvider: IdentityProvider = identityProviders.find(
    (identityProvider) => identityProvider.description === description,
  );
  expect(
    identityProvider,
    `No identity provider matches the description '${description}'`,
  ).to.exist;
  cy.wrap(identityProvider).as('identityProvider');
  return identityProvider;
};

export const getDefaultIdentityProvider = (
  identityProviders: IdentityProvider[],
): IdentityProvider =>
  getIdentityProviderByDescription(identityProviders, DEFAULT_IDP_DESCRIPTION);
