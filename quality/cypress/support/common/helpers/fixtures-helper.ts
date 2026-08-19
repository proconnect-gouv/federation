import { cloneDeep } from "lodash";

import apiCommon from "../../../fixtures/fca-low/docker/api-common.json";
import environment from "../../../fixtures/fca-low/docker/environment.json";
import idpConfigs from "../../../fixtures/fca-low/docker/identity-provider-configs.json";
import idpList from "../../../fixtures/fca-low/docker/identity-providers.json";
import spConfigs from "../../../fixtures/fca-low/docker/service-provider-configs.json";
import spList from "../../../fixtures/fca-low/docker/service-providers.json";
import {
  Environment,
  IdentityProvider,
  IdentityProviderConfig,
  ServiceProvider,
  ServiceProviderConfig,
} from "../types";

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
  return cloneDeep(spConfigs["default"]);
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
  return cloneDeep(environment);
};

export const getFcaAuthorizeUrl = (): string => {
  return (apiCommon as { authorize: { url: string } }).authorize.url;
};
