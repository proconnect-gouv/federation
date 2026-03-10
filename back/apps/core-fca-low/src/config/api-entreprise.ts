import { ApiEntrepriseConfig } from '@fc/api-entreprise';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'ApiEntreprise');

export default {
  token: env.string('API_TOKEN'),
  baseUrl: env.string('API_BASE_URL'),
  shouldMockApi: env.boolean('SHOULD_MOCK_API') || false,
  featureFetchOrganizationData: env.boolean('FEATURE_FETCH_ORGANIZATION_DATA'),
  organizationSiret: '13002526500013',
  cachedTTL: 86400000, // 24h
} as ApiEntrepriseConfig;
