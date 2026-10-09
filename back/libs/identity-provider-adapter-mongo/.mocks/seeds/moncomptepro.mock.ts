import type { IdentityProvider } from "../../src/schemas";

export const MonCompteProIdentityProviderDocument: Partial<IdentityProvider> = {
  active: true,
  client_secret:
    "aPW2jUBNAQkg7onZG6Q6BiuIBN2IzbN4KJBrQVOEGwWAyA6qT/kCpVVsR91+EN4M5+mGYMWn973OzPdM",
  clientID: "myclientidformoncomptepro",
  discovery: true,
  discoveryUrl:
    "https://moncomptepro.docker.dev-franceconnect.fr/.well-known/openid-configuration",
  id_token_encrypted_response_alg: "",
  id_token_encrypted_response_enc: "",
  id_token_signed_response_alg: "ES256",
  isRoutingEnabled: true,
  name: "moncomptepro",
  response_types: ["code"],
  siret: "12345678910009",
  supportEmail: "support+federation@example.com",
  title: "moncomptepro",
  token_endpoint_auth_method: "client_secret_post",
  uid: "71144ab3-ee1a-4401-b7b3-79b44f7daeeb",
  userinfo_encrypted_response_alg: "",
  userinfo_encrypted_response_enc: "",
  userinfo_signed_response_alg: "ES256",
  isEntraID: false,
  extraAcceptedEmailDomains: [],
  isBlockingForUnlistedEmailDomainsEnabled: false,
  useTheHyyyperbridge: false,
  isMfaCompliant: false,
};
