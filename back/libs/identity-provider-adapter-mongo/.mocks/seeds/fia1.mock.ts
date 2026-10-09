import type { IdentityProvider } from "../../src/schemas";

export const Fia1IdentityProviderDocument: Partial<IdentityProvider> = {
  active: true,
  client_secret:
    "3Uk6QQ3OZ7BsNz8FNrhFY2xmIy7bkP23JhRP4zQU199t2nz7KOJvLxBZeWcOs4vZxNNJ7e/5T7NqS9Nq",
  clientID: "myclientidforfia1-low",
  discovery: true,
  discoveryUrl:
    "https://fia1-low.docker.dev-franceconnect.fr/.well-known/openid-configuration",
  id_token_encrypted_response_alg: "",
  id_token_encrypted_response_enc: "",
  id_token_signed_response_alg: "ES256",
  isRoutingEnabled: true,
  name: "fia1-low",
  response_types: ["code"],
  siret: "81801912700021",
  supportEmail: "support+federation@example.com",
  title: "fia1-low",
  token_endpoint_auth_method: "client_secret_post",
  uid: "9c716f61-b8a1-435c-a407-ef4d677ec270",
  userinfo_encrypted_response_alg: "",
  userinfo_encrypted_response_enc: "",
  userinfo_signed_response_alg: "ES256",
  isEntraID: false,
  extraAcceptedEmailDomains: [],
  isBlockingForUnlistedEmailDomainsEnabled: false,
  useTheHyyyperbridge: false,
  isMfaCompliant: false,
};
