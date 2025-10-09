import idpConfigsForDockerEnv from '../../../fixtures/fca-low/docker/identity-provider-configs.json';
import idpForDockerEnv from '../../../fixtures/fca-low/docker/identity-providers.json';
import spConfigsForDockerEnv from '../../../fixtures/fca-low/docker/service-provider-configs.json';
import idpConfigsForIntegEnv from '../../../fixtures/fca-low/integ01/identity-provider-configs.json';
import idpForIntegEnv from '../../../fixtures/fca-low/integ01/identity-providers.json';
import spConfigsForIntegEnv from '../../../fixtures/fca-low/integ01/service-provider-configs.json';
import {
  IdentityProvider,
  IdentityProviderConfig,
  ServiceProvider,
  ServiceProviderConfig,
} from '../types';
import spForDockerEnv from './../../../fixtures/fca-low/docker/service-providers.json';
import spForIntegEnv from './../../../fixtures/fca-low/integ01/service-providers.json';

const isDockerEnv = Cypress.env('TEST_ENV') === 'docker';

const spList = isDockerEnv ? spForDockerEnv : spForIntegEnv;
const spConfigs = isDockerEnv ? spConfigsForDockerEnv : spConfigsForIntegEnv;
const idpList = isDockerEnv ? idpForDockerEnv : idpForIntegEnv;
const idpConfigs = isDockerEnv ? idpConfigsForDockerEnv : idpConfigsForIntegEnv;

export const getServiceProviderByDescription = (
  description: string,
): ServiceProvider => {
  const serviceProvider: ServiceProvider = spList.find((serviceProvider) =>
    serviceProvider.descriptions.includes(description),
  );
  expect(
    serviceProvider,
    `A service provider matches the description '${description}'`,
  ).to.exist;
  return serviceProvider;
};

export const getDefaultServiceProviderConfig = (): ServiceProviderConfig => {
  return spConfigs['default'];
};

export const getIdentityProviderByDescription = (
  description: string,
): IdentityProvider => {
  const identityProvider: IdentityProvider = idpList.find((identityProvider) =>
    identityProvider.descriptions.includes(description),
  );
  expect(
    identityProvider,
    `An identity provider matches the description '${description}'`,
  ).to.exist;
  return identityProvider;
};

export const getDefaultIdentityProviderConfig = (
  providerName: string,
): IdentityProviderConfig => {
  return idpConfigs[providerName];
};
