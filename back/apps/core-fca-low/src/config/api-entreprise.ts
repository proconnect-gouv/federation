import { ApiEntrepriseConfig } from "#libs/api-entreprise";
import { ConfigParser } from "#libs/config";

const env = new ConfigParser(process.env, "ApiEntreprise");

const apiEntrepriseConfig: ApiEntrepriseConfig = {
  token: env.string("API_TOKEN"),
  baseUrl: env.string("API_BASE_URL"),
  shouldMockApi: env.boolean("SHOULD_MOCK_API") || false,
  featureFetchOrganizationData: env.boolean("FEATURE_FETCH_ORGANIZATION_DATA"),
  organizationSiret: "13002526500013",
  cachedTTL: 86400000, // 24h
  cacheTTLWhenApiEntrepriseIsDown: 7776000000, // 90 days
};

export default apiEntrepriseConfig;
