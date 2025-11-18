import { cloneDeep } from 'lodash';

import idpConfigsForDockerEnv from '../../../fixtures/fca-low/docker/identity-provider-configs.json';
import idpForDockerEnv from '../../../fixtures/fca-low/docker/identity-providers.json';
import spConfigsForDockerEnv from '../../../fixtures/fca-low/docker/service-provider-configs.json';
import apiCommonForDockerEnv from './../../../fixtures/fca-low/docker/api-common.json';
import environnementForDockerEnv from './../../../fixtures/fca-low/docker/environment.json';
import spForDockerEnv from './../../../fixtures/fca-low/docker/service-providers.json';

import idpConfigsForIntegEnv from '../../../fixtures/fca-low/integ01/identity-provider-configs.json';
import idpForIntegEnv from '../../../fixtures/fca-low/integ01/identity-providers.json';
import spConfigsForIntegEnv from '../../../fixtures/fca-low/integ01/service-provider-configs.json';
import apiCommonForIntegEnv from './../../../fixtures/fca-low/integ01/api-common.json';
import environnementForIntegEnv from './../../../fixtures/fca-low/integ01/environment.json';
import spForIntegEnv from './../../../fixtures/fca-low/integ01/service-providers.json';

import idpConfigsForKubeMvp0Env from '../../../fixtures/fca-low/kube-mvp0/identity-provider-configs.json';
import idpForKubeMvp0Env from '../../../fixtures/fca-low/kube-mvp0/identity-providers.json';
import spConfigsForKubeMvp0Env from '../../../fixtures/fca-low/kube-mvp0/service-provider-configs.json';
import apiCommonForKubeMvp0Env from './../../../fixtures/fca-low/kube-mvp0/api-common.json';
import environnementForKubeMvp0Env from './../../../fixtures/fca-low/kube-mvp0/environment.json';
import spForKubeMvp0Env from './../../../fixtures/fca-low/kube-mvp0/service-providers.json';

import {
  Environment,
  IdentityProvider,
  IdentityProviderConfig,
  ServiceProvider,
  ServiceProviderConfig,
} from '../types';

type EnvKey = 'docker' | 'integ01' | 'kube-mvp0';
type FixturesConfiguration = {
  sp: ServiceProvider[];
  idp: IdentityProvider[];
  idpConfig: Record<string, IdentityProviderConfig>;
  spConfig: Record<string, ServiceProviderConfig>;
  apiCommon: Record<string, unknown>;
  environment: Environment;
};

const fixturesByEnv: Record<EnvKey, FixturesConfiguration> = {
  docker: {
    sp: spForDockerEnv,
    idp: idpForDockerEnv,
    idpConfig: idpConfigsForDockerEnv,
    spConfig: spConfigsForDockerEnv,
    apiCommon: apiCommonForDockerEnv,
    environment: environnementForDockerEnv,
  },
  integ01: {
    sp: spForIntegEnv,
    idp: idpForIntegEnv,
    idpConfig: idpConfigsForIntegEnv,
    spConfig: spConfigsForIntegEnv,
    apiCommon: apiCommonForIntegEnv,
    environment: environnementForIntegEnv,
  },
  'kube-mvp0': {
    sp: spForKubeMvp0Env,
    idp: idpForKubeMvp0Env,
    idpConfig: idpConfigsForKubeMvp0Env,
    spConfig: spConfigsForKubeMvp0Env,
    apiCommon: apiCommonForKubeMvp0Env,
    environment: environnementForKubeMvp0Env,
  },
};

const TEST_ENV = Cypress.env('TEST_ENV') as EnvKey;

const currentFixtures = fixturesByEnv[TEST_ENV];
if (!currentFixtures) throw new Error(`Unsupported TEST_ENV: ${TEST_ENV}`);

const {
  sp: spList,
  idp: idpList,
  spConfig: spConfigs,
  idpConfig: idpConfigs,
  apiCommon,
  environment: environnement,
} = currentFixtures;

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
