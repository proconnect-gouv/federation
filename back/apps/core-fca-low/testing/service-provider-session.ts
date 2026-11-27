import type { Response as HttpResponse } from "supertest";

import {
  serviceProviders,
  serviceProvidersClientSecret,
} from "#seed/service-providers";
import TEST_CONFIG from "../.mocks/config";
import type { TestingBench } from "./test-bench";

export type AuthorizeQuery = Partial<{
  acr_values: string;
  claims: string;
  client_id: string;
  idp_hint: string;
  login_hint: string;
  nonce: string;
  prompt: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  siret_hint: string;
  state: string;
}>;

export type ResolvedAuthorizeQuery = AuthorizeQuery &
  Required<
    Pick<
      AuthorizeQuery,
      | "acr_values"
      | "client_id"
      | "nonce"
      | "redirect_uri"
      | "response_type"
      | "scope"
      | "state"
    >
  >;

export type ServiceProviderSessionState = "fresh" | "authorized" | "signed-in";

export class ServiceProviderSession<
  State extends ServiceProviderSessionState = "fresh",
> {
  readonly query: ResolvedAuthorizeQuery;
  readonly state: State;

  constructor(
    private readonly bench: TestingBench,
    readonly name: keyof typeof serviceProviders,
    query: AuthorizeQuery = {},
    readonly agent = bench.agent(),
    readonly authorizeResponse?: HttpResponse,
    state: State = "fresh" as State,
  ) {
    const { key, redirect_uris } = serviceProviders[name];
    this.query = {
      acr_values: "eidas1",
      client_id: key,
      nonce: "sp-nonce-of-at-least-32-characters-long",
      redirect_uri: redirect_uris[0],
      response_type: "code",
      scope: "openid email given_name usual_name",
      state: "sp-state-of-at-least-32-characters-long",
      ...query,
    };
    this.state = state;
  }

  async authorize(this: ServiceProviderSession<"fresh">) {
    const response = await this.#authorize();
    return { response, session: this.#next("authorized", response) };
  }

  async signIn(
    this: ServiceProviderSession<"fresh" | "authorized">,
    { email = "jean@fia1.fr" }: { email?: string } = {},
  ) {
    const authorize = this.authorizeResponse ?? (await this.#authorize());
    const interaction = await this.agent.get(
      this.#path(authorize.headers.location),
    );
    const redirectToIdp =
      interaction.status === 200
        ? await this.agent
            .post("/redirect-to-idp")
            .type("form")
            .send({
              csrfToken: /name="csrfToken" value="([^"]+)"/.exec(
                interaction.text,
              )[1],
              email,
            })
        : undefined;
    const idpAuthorization = new URL(
      (redirectToIdp ?? interaction).headers.location,
    );
    const { code, state } = this.bench.identityProviders.login(
      idpAuthorization.href,
      {
        idToken: {
          acr: idpAuthorization.searchParams.get("acr_values").split(" ")[0],
          amr: ["pwd"],
          sub: email,
        },
        userinfo: {
          email,
          given_name: "Jean",
          siret: "21340126800130",
          sub: email,
          uid: email,
          usual_name: "Bon",
        },
      },
    );
    const callback = await this.agent
      .get("/oidc-callback")
      .query({ code, state });
    const verify = await this.agent.get(this.#path(callback.headers.location));
    const resume = await this.agent.get(this.#path(verify.headers.location));
    const token = await this.bench.request
      .post("/token")
      .type("form")
      .send({
        client_id: this.query.client_id,
        client_secret: serviceProvidersClientSecret,
        code: new URL(resume.headers.location).searchParams.get("code"),
        grant_type: "authorization_code",
        redirect_uri: this.query.redirect_uri,
      });
    return {
      authorize,
      callback,
      interaction,
      redirectToIdp,
      resume,
      session: this.#next("signed-in"),
      token,
      verify,
    };
  }

  #authorize() {
    return this.agent.get("/authorize").query(this.query);
  }

  #next<Next extends ServiceProviderSessionState>(
    state: Next,
    authorizeResponse?: HttpResponse,
  ) {
    return new ServiceProviderSession<Next>(
      this.bench,
      this.name,
      this.query,
      this.agent,
      authorizeResponse,
      state,
    );
  }

  #path(location: string) {
    const url = new URL(location, "http://bench");
    return url.pathname.replace(TEST_CONFIG.App.urlPrefix, "") + url.search;
  }
}
