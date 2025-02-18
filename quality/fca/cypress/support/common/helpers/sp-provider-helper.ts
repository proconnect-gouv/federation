import { ServiceProvider } from '../types';
import spForDockerEnv from './../../../fixtures/fca-low/docker/service-providers.json';
import spForIntegEnv from './../../../fixtures/fca-low/integ01/service-providers.json';

const testEnv: string = Cypress.env('TEST_ENV');
const serviceProviders = testEnv === 'docker' ? spForDockerEnv : spForIntegEnv;

export const getServiceProviderByDescription = (
  description: string,
): ServiceProvider => {
  const serviceProvider: ServiceProvider = serviceProviders.find(
    (serviceProvider) => serviceProvider.descriptions.includes(description),
  );
  expect(
    serviceProvider,
    `A service provider matches the description '${description}'`,
  ).to.exist;
  return serviceProvider;
};
