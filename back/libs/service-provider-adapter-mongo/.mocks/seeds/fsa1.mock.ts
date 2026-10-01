import type { ServiceProvider } from "../../src/schemas";

export const Fsa1ServiceProviderDocument: Partial<ServiceProvider> = {
  active: true,
  client_id: "fsa_fsa1_low_client_id",
  client_secret:
    "sltxkJ/ZDXgH0yt11WnqZruUypVtvYm15mbz8l0fWXNJ1ozBbdD0uFrOVfYcEDAExZO3rgpEsLAPWDFGsUg79AsztcA88EEe/31Z/ykSdaUM6GGqn5WNlSbkH+Q=",
  id_token_signed_response_alg: "HS256",
  key: "fsa_fsa1_low_key",
  name: "FSA - FSA1-LOW",
  post_logout_redirect_uris: ["https://fsa1-low.docker.dev-franceconnect.fr/"],
  redirect_uris: ["https://fsa1-low.docker.dev-franceconnect.fr/oidc-callback"],
  scopes: [
    "uid",
    "openid",
    "given_name",
    "email",
    "phone",
    "organizational_unit",
    "siren",
    "siret",
    "usual_name",
    "belonging_population",
    "chorusdt",
    "idp_id",
    "idp_acr",
    "groups",
    "custom",
  ],
  type: "public",
};
