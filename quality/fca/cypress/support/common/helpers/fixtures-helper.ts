import dockerEnvIdpConfigs from '../../../fixtures/fca-low/docker/identity-provider-configs.json';
import dockerEnvIdp from '../../../fixtures/fca-low/docker/identity-providers.json';
import dockerEnvSpConfigs from '../../../fixtures/fca-low/docker/service-provider-configs.json';
import integEnvIdpConfigs from '../../../fixtures/fca-low/integ01/identity-provider-configs.json';
import integEnvIdp from '../../../fixtures/fca-low/integ01/identity-providers.json';
import integEnvSpConfigs from '../../../fixtures/fca-low/integ01/service-provider-configs.json';
import kubeMvp0EnvIdpConfigs from '../../../fixtures/fca-low/kube-mvp0/identity-provider-configs.json';
import kubeMvp0EnvIdp from '../../../fixtures/fca-low/kube-mvp0/identity-providers.json';
import kubeMvp0EnvSpConfigs from '../../../fixtures/fca-low/kube-mvp0/service-provider-configs.json';
import {
  IdentityProvider,
  IdentityProviderConfig,
  ServiceProvider,
  ServiceProviderConfig,
} from '../types';
import dockerEnvSp from './../../../fixtures/fca-low/docker/service-providers.json';
import integEnvSp from './../../../fixtures/fca-low/integ01/service-providers.json';
import kubeMvp0EnvSp from './../../../fixtures/fca-low/kube-mvp0/service-providers.json';

let spList: ServiceProvider[],
  spConfigs: { [key: string]: ServiceProviderConfig },
  idpList: IdentityProvider[],
  idpConfigs: { [key: string]: IdentityProviderConfig };

switch (Cypress.env('TEST_ENV')) {
  case 'kube-mvp0':
    spList = kubeMvp0EnvSp;
    spConfigs = kubeMvp0EnvSpConfigs;
    idpList = kubeMvp0EnvIdp;
    idpConfigs = kubeMvp0EnvIdpConfigs;
    break;
  case 'integ01':
    spList = integEnvSp;
    spConfigs = integEnvSpConfigs;
    idpList = integEnvIdp;
    idpConfigs = integEnvIdpConfigs;
    break;
  case 'docker':
  default:
    spList = dockerEnvSp;
    spConfigs = dockerEnvSpConfigs;
    idpList = dockerEnvIdp;
    idpConfigs = dockerEnvIdpConfigs;
}
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
