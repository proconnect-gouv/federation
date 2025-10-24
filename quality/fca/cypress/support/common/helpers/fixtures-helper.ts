import { cloneDeep } from 'lodash';

import idpConfigsForDockerEnv from '../../../fixtures/fca-low/docker/identity-provider-configs.json';
import idpForDockerEnv from '../../../fixtures/fca-low/docker/identity-providers.json';
import spConfigsForDockerEnv from '../../../fixtures/fca-low/docker/service-provider-configs.json';
import idpConfigsForIntegEnv from '../../../fixtures/fca-low/integ01/identity-provider-configs.json';
import idpForIntegEnv from '../../../fixtures/fca-low/integ01/identity-providers.json';
import spConfigsForIntegEnv from '../../../fixtures/fca-low/integ01/service-provider-configs.json';
import {
  Environment,
  IdentityProvider,
  IdentityProviderConfig,
  ServiceProvider,
  ServiceProviderConfig,
} from '../types';
import apiCommonForDockerEnv from './../../../fixtures/fca-low/docker/api-common.json';
import environnementForDockerEnv from './../../../fixtures/fca-low/docker/environment.json';
import spForDockerEnv from './../../../fixtures/fca-low/docker/service-providers.json';
import apiCommonForIntegEnv from './../../../fixtures/fca-low/integ01/api-common.json';
import environnementForIntegEnv from './../../../fixtures/fca-low/integ01/environment.json';
import spForIntegEnv from './../../../fixtures/fca-low/integ01/service-providers.json';

const isDockerEnv = Cypress.env('TEST_ENV') === 'docker';

const spList = isDockerEnv ? spForDockerEnv : spForIntegEnv;
const spConfigs = isDockerEnv ? spConfigsForDockerEnv : spConfigsForIntegEnv;
const idpList = isDockerEnv ? idpForDockerEnv : idpForIntegEnv;
const idpConfigs = isDockerEnv ? idpConfigsForDockerEnv : idpConfigsForIntegEnv;
const apiCommon = isDockerEnv ? apiCommonForDockerEnv : apiCommonForIntegEnv;
const environnement = isDockerEnv
  ? environnementForDockerEnv
  : environnementForIntegEnv;

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
  return cloneDeep(serviceProvider);
};

export const getDefaultServiceProviderConfig = (): ServiceProviderConfig => {
  return cloneDeep(spConfigs['default']);
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
  return cloneDeep(identityProvider);
};

export const getDefaultIdentityProviderConfig = (
  providerName: string,
): IdentityProviderConfig => {
  return cloneDeep(idpConfigs[providerName]);
};

export const getApiRequests = (requestKey: string): Record<string, unknown> => {
  return cloneDeep(apiCommon[requestKey]);
};

export const getEnv = (): Environment => {
  return cloneDeep(environnement);
};
