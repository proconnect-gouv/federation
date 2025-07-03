export default {
  defaultValues: {
    featureHandlers: JSON.parse(process.env.IDP_DEFAULT_FEATURE_HANDLERS),
    response_types: JSON.parse(process.env.IDP_DEFAULT_RESPONSE_TYPES),
    revocation_endpoint_auth_method:
      process.env.IDP_DEFAULT_REVOCATION_ENDPOINT_AUTH_METHOD,
  },
  coreInstance: process.env.IDP_CORE_INSTANCE,
  coreIssuer: process.env.IDP_CORE_ISSUER,
};
