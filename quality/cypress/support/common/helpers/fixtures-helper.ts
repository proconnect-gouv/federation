// @ts-expect-error — no types for lodash
import { cloneDeep } from "lodash";

// Docker
import apiCommonForDockerEnv from "../../../fixtures/fca-low/docker/api-common.json";
import environmentForDockerEnv from "../../../fixtures/fca-low/docker/environment.json";
import idpConfigsForDockerEnv from "../../../fixtures/fca-low/docker/identity-provider-configs.json";
import idpForDockerEnv from "../../../fixtures/fca-low/docker/identity-providers.json";
import spConfigsForDockerEnv from "../../../fixtures/fca-low/docker/service-provider-configs.json";
import spForDockerEnv from "../../../fixtures/fca-low/docker/service-providers.json";
// Integ01
import apiCommonForIntegEnv from "../../../fixtures/fca-low/integ01/api-common.json";
import environmentForIntegEnv from "../../../fixtures/fca-low/integ01/environment.json";
import idpConfigsForIntegEnv from "../../../fixtures/fca-low/integ01/identity-provider-configs.json";
import idpForIntegEnv from "../../../fixtures/fca-low/integ01/identity-providers.json";
import spConfigsForIntegEnv from "../../../fixtures/fca-low/integ01/service-provider-configs.json";
import spForIntegEnv from "../../../fixtures/fca-low/integ01/service-providers.json";
// Kube MVP0
import environmentForKubeMvp0Env from "../../../fixtures/fca-low/k8s/environment.json";
import idpForKubeMvp0Env from "../../../fixtures/fca-low/k8s/identity-providers.json";
import spForKubeMvp0Env from "../../../fixtures/fca-low/k8s/service-providers.json";
import {
  Environment,
  IdentityProvider,
  IdentityProviderConfig,
  ServiceProvider,
  ServiceProviderConfig,
} from "../types";

type EnvKey = "docker" | "integ01" | "k8s";

type FixturesConfiguration = {
  apiCommon: Record<string, unknown>;
  environment: Environment;
  idpConfigs: Record<string, IdentityProviderConfig>;
  idpList: IdentityProvider[];
  spConfigs: Record<string, ServiceProviderConfig>;
  spList: ServiceProvider[];
};

const fixturesByEnv: Record<EnvKey, FixturesConfiguration> = {
  docker: {
    apiCommon: apiCommonForDockerEnv,
    environment: environmentForDockerEnv,
    idpConfigs: idpConfigsForDockerEnv,
    idpList: idpForDockerEnv,
    spConfigs: spConfigsForDockerEnv,
    spList: spForDockerEnv,
  },
  integ01: {
    apiCommon: apiCommonForIntegEnv,
    environment: environmentForIntegEnv,
    idpConfigs: idpConfigsForIntegEnv,
    idpList: idpForIntegEnv,
    spConfigs: spConfigsForIntegEnv,
    spList: spForIntegEnv,
  },
  k8s: {
    apiCommon: {},
    environment: environmentForKubeMvp0Env,
    idpConfigs: {},
    idpList: idpForKubeMvp0Env,
    spConfigs: {},
    spList: spForKubeMvp0Env,
  },
};

const TEST_ENV = Cypress.env("TEST_ENV") as EnvKey;

const currentFixtures = fixturesByEnv[TEST_ENV];
if (!currentFixtures) throw new Error(`Unsupported TEST_ENV: ${TEST_ENV}`);

const { apiCommon, environment, idpConfigs, idpList, spConfigs, spList } =
  currentFixtures;

export const getServiceProviderByDescription = (
  description: string,
): ServiceProvider => {
  const serviceProvider = spList.find((serviceProvider) =>
    serviceProvider.descriptions.includes(description),
  ) as ServiceProvider;
  expect(
    serviceProvider,
    `A service provider matches the description '${description}'`,
  ).to.exist;
  return cloneDeep(serviceProvider);
};

export const getDefaultServiceProviderConfig = (): ServiceProviderConfig => {
  return cloneDeep(spConfigs["default"]);
};

export const getIdentityProviderByDescription = (
  description: string,
): IdentityProvider => {
  const identityProvider = idpList.find((identityProvider) =>
    identityProvider.descriptions.includes(description),
  ) as IdentityProvider;
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
  return cloneDeep(environment);
};

export const getFcaAuthorizeUrl = (): string => {
  return (apiCommon as { authorize: { url: string } }).authorize.url;
};
