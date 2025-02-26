import { IdentityProvider } from '../types';
import idpForDockerEnv from './../../../fixtures/fca-low/docker/identity-providers.json';
import idpForIntegEnv from './../../../fixtures/fca-low/integ01/identity-providers.json';

const testEnv: string = Cypress.env('TEST_ENV');
const identityProviders =
  testEnv === 'docker' ? idpForDockerEnv : idpForIntegEnv;

export const getIdentityProviderByDescription = (
  description: string,
): IdentityProvider => {
  const identityProvider: IdentityProvider = identityProviders.find(
    (identityProvider) => identityProvider.descriptions.includes(description),
  );
  expect(
    identityProvider,
    `An identity provider matches the description '${description}'`,
  ).to.exist;
  return identityProvider;
};
