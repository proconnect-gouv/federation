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
  readonly #cookies: Map<string, string>;
  readonly query: ResolvedAuthorizeQuery;
  readonly state: State;

  constructor(
    private readonly bench: TestingBench,
    readonly name: keyof typeof serviceProviders,
    query: AuthorizeQuery = {},
    cookies = new Map<string, string>(),
    readonly authorizeResponse?: HttpResponse,
    state: State = "fresh" as State,
  ) {
    const { key, redirect_uris } = serviceProviders[name];
    this.#cookies = cookies;
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
    const interaction = this.#keep(
      await this.bench.request
        .get(this.#path(authorize.headers.location))
        .set("Cookie", this.#cookie()),
    );
    const redirectToIdp =
      interaction.status === 200
        ? this.#keep(
            await this.bench.request
              .post("/redirect-to-idp")
              .type("form")
              .set("Cookie", this.#cookie())
              .send({
                csrfToken: /name="csrfToken" value="([^"]+)"/.exec(
                  interaction.text,
                )[1],
                email,
              }),
          )
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
    const callback = this.#keep(
      await this.bench.request
        .get("/oidc-callback")
        .query({ code, state })
        .set("Cookie", this.#cookie()),
    );
    const verify = this.#keep(
      await this.bench.request
        .get(this.#path(callback.headers.location))
        .set("Cookie", this.#cookie()),
    );
    const resume = this.#keep(
      await this.bench.request
        .get(this.#path(verify.headers.location))
        .set("Cookie", this.#cookie()),
    );
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

  async #authorize() {
    return this.#keep(
      await this.bench.request
        .get("/authorize")
        .query(this.query)
        .set("Cookie", this.#cookie()),
    );
  }

  #cookie() {
    return [...this.#cookies.values()].join("; ");
  }

  #keep(response: HttpResponse) {
    for (const cookie of [response.headers["set-cookie"] ?? []].flat())
      this.#cookies.set(cookie.split("=")[0], cookie.split(";")[0]);
    return response;
  }

  #next<Next extends ServiceProviderSessionState>(
    state: Next,
    authorizeResponse?: HttpResponse,
  ) {
    return new ServiceProviderSession<Next>(
      this.bench,
      this.name,
      this.query,
      this.#cookies,
      authorizeResponse,
      state,
    );
  }

  #path(location: string) {
    const url = new URL(location, "http://bench");
    return url.pathname.replace(TEST_CONFIG.App.urlPrefix, "") + url.search;
  }
}
